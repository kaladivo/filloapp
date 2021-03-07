import httpStatus from 'http-status-codes'
import Schema from 'validate'
import Router from 'koa-router'
import moment from 'moment'
import * as errorCodes from '../../../constants/errorCodes'
import {FORBIDDEN, NOT_DELETED} from '../../../constants/errorCodes'
import * as blueprintsRoutes from '../../../constants/api/blueprints'
import validateBodyMiddleware from '../../utils/validateBodyMiddleware'
import {
	extractUserWithCustomer,
	withValidUserWithCustomerMiddleware,
} from '../../utils/auth'
import {
	extractDriveApiForServiceAccount,
	extractUserDriveApi,
	withServiceAccountDriveApiMiddleware,
	withUserDriveApiMiddleware,
} from '../../utils/googleApis'
import {
	getBlueprintFields,
	getFileMetadata,
	shareFileToServiceAccount,
} from './utils'
import SendableError from '../../utils/SendableError'
import {
	createOrUpdateBlueprint,
	deleteBlueprint,
	doesBlueprintExist,
	getBlueprintById,
	InputBlueprintField,
	listBlueprints,
	listTinyBlueprints,
	searchBlueprints,
} from './db'
import {extractDbClient, withDataDbMiddleware} from '../../dbService'
import withPaginationMiddleware, {
	extractPagination,
} from '../../utils/withPaginationMiddleware'
import {BlueprintField} from '../../../constants/models/Blueprint'

const router = new Router()

const createBlueprintSchema = new Schema({
	fileId: {
		type: String,
		required: true,
	},
	isSubmitted: {
		type: Boolean,
		required: true,
	},
	fieldsOptions: {
		type: Array,
		required: true,
		each: {
			name: {type: String, required: true},
			type: {type: String, required: true},
			helperText: String,
			displayName: String,
			options: {
				multiline: {
					required: false,
					type: Boolean,
				},
			},
		},
	},
})

router.post(
	blueprintsRoutes.upsertBlueprint,
	validateBodyMiddleware(createBlueprintSchema),
	withValidUserWithCustomerMiddleware,
	withServiceAccountDriveApiMiddleware,
	withUserDriveApiMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const saDrive = extractDriveApiForServiceAccount(ctx)
		const userDrive = extractUserDriveApi(ctx)
		const user = extractUserWithCustomer(ctx)
		const dbClient = extractDbClient(ctx)
		const {fileId, fieldsOptions, isSubmitted} = ctx.request.body

		const exists = await doesBlueprintExist({fileId, dbClient, user})

		const {mimeType, name} = await getFileMetadata({fileId, drive: userDrive})
		if (mimeType !== 'application/vnd.google-apps.document') {
			throw new SendableError('File submitted is not document', {
				status: httpStatus.BAD_REQUEST,
				errorCode: errorCodes.BAD_FILE_TYPE,
			})
		}

		await shareFileToServiceAccount({fileId, drive: userDrive})

		let fieldsNames: string[] = fieldsOptions.map(
			(one: BlueprintField) => one.name
		)

		// If blueprint is being created, make sure to scan it and add fields names accordingly
		if (!exists) {
			try {
				fieldsNames = await getBlueprintFields({
					fileId: ctx.request.body.fileId,
					drive: saDrive,
				})
			} catch (e) {
				throw new SendableError(
					'Unable to parse fields',
					{
						status: httpStatus.BAD_REQUEST,
						errorCode: errorCodes.UNKNOWN,
					},
					{error: e}
				)
			}
		}

		const fields = fieldsNames.map((fieldName) => {
			const fieldOption = fieldsOptions.find(
				(option: BlueprintField) => option.name === fieldName
			)
			if (!fieldOption) {
				return {
					type: 'string',
					name: fieldName,
					displayName: fieldName,
				}
			}
			return {
				name: fieldName,
				// TODO check if type is valid maybe?
				type: fieldOption.type,
				displayName: fieldOption.displayName || fieldName,
				helperText: fieldOption.helperText || null,
				options: fieldOption.options || {},
			}
		}) as InputBlueprintField[]

		try {
			const createdBlueprint = await createOrUpdateBlueprint({
				fileId,
				isSubmitted,
				fileName: name || moment().format('DD. MM. YYYY - HH:MM:SS'),
				user,
				dbClient,
				fields,
			})

			ctx.body = createdBlueprint
			ctx.status =
				createdBlueprint.performedAction === 'create'
					? httpStatus.CREATED
					: httpStatus.OK
		} catch (e) {
			throw new SendableError(
				'Unable to create blueprint',
				{
					status: httpStatus.BAD_REQUEST,
					errorCode: errorCodes.UNKNOWN,
				},
				{error: e}
			)
		}

		await next()
	}
)

router.get(
	blueprintsRoutes.searchBlueprints,
	withValidUserWithCustomerMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUserWithCustomer(ctx)
		const dbClient = extractDbClient(ctx)
		const onlySubmitted = ctx.request.query.onlySubmitted === 'true'

		const {query} = ctx.request.query

		if (!query) {
			throw new SendableError('Missing query', {
				status: httpStatus.BAD_REQUEST,
				errorCode: errorCodes.BAD_BODY,
			})
		}

		ctx.body = await searchBlueprints({
			dbClient,
			query,
			user,
			onlySubmitted,
			customerWide: user.selectedCustomer.permissions.canSeeAllBlueprints,
		})
		await next()
	}
)

router.get(
	blueprintsRoutes.getBlueprint,
	withValidUserWithCustomerMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUserWithCustomer(ctx)
		const dbClient = extractDbClient(ctx)
		const {blueprintId} = ctx.params

		const blueprint = await getBlueprintById({
			blueprintId,
			dbClient,
			customerId: user.selectedCustomer.customerId,
		})

		if (!blueprint) {
			throw new SendableError('Blueprint was not found.', {
				status: httpStatus.NOT_FOUND,
				errorCode: errorCodes.NOT_FOUND,
			})
		}

		if (
			blueprint.owner.email !== user.email &&
			!user.selectedCustomer.permissions.canModifyAllBlueprints
		) {
			throw new SendableError('Insufficient permissions', {
				status: httpStatus.FORBIDDEN,
				errorCode: FORBIDDEN,
			})
		}

		ctx.body = blueprint

		await next()
	}
)

router.get(
	blueprintsRoutes.listBlueprints,
	withValidUserWithCustomerMiddleware,
	withPaginationMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUserWithCustomer(ctx)
		const dbClient = extractDbClient(ctx)
		const pagination = extractPagination(ctx)
		const onlySubmitted = ctx.request.query.onlySubmitted === 'true'

		ctx.body = await listBlueprints({
			dbClient,
			user,
			pagination,
			onlySubmitted,
			customerWide: user.selectedCustomer.permissions.canSeeAllBlueprints,
		})
		await next()
	}
)

router.get(
	blueprintsRoutes.listBlueprintsTiny,
	withValidUserWithCustomerMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUserWithCustomer(ctx)
		const dbClient = extractDbClient(ctx)
		const onlySubmitted = ctx.request.query.onlySubmitted === 'true'

		ctx.body = await listTinyBlueprints({
			dbClient,
			user,
			onlySubmitted,
			customerWide: user.selectedCustomer.permissions.canSeeAllBlueprints,
		})
		await next()
	}
)

router.delete(
	blueprintsRoutes.deleteBlueprint,
	withValidUserWithCustomerMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUserWithCustomer(ctx)
		const dbClient = extractDbClient(ctx)
		const {blueprintId} = ctx.params

		const blueprintToDelete = await getBlueprintById({
			blueprintId,
			dbClient,
			customerId: user.selectedCustomer.customerId,
		})

		if (!blueprintToDelete) {
			throw new SendableError(
				'Blueprint was not deleted. Make sure it exists and you have the correct permissions',
				{
					status: httpStatus.OK,
					errorCode: NOT_DELETED,
				}
			)
		}

		if (
			blueprintToDelete.owner.email !== user.email &&
			!user.selectedCustomer.permissions.canModifyAllBlueprints
		) {
			throw new SendableError('Insufficient permissions', {
				status: httpStatus.FORBIDDEN,
				errorCode: FORBIDDEN,
			})
		}

		await deleteBlueprint({
			dbClient,
			blueprintId,
		})
		ctx.body = {deleted: blueprintId}

		await next()
	}
)

export default router
