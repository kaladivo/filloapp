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
	createBlueprint,
	deleteBlueprint,
	doesBlueprintExist,
	getBlueprintById,
	InputBlueprintField,
	listBlueprints,
	listTinyBlueprints,
	searchBlueprints,
	updateBlueprint,
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
	name: {
		type: String,
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
	blueprintsRoutes.createBlueprint,
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
		const {
			fileId,
			fieldsOptions,
			isSubmitted,
			name: chosenName,
		} = ctx.request.body

		if (await doesBlueprintExist({fileId, dbClient, user})) {
			throw new SendableError(
				`Blueprint with document: ${fileId} for user: ${user.googleAccessToken} was already created`,
				{
					errorCode: errorCodes.ALREADY_EXISTS,
					status: httpStatus.CONFLICT,
				}
			)
		}

		await shareFileToServiceAccount({fileId, drive: userDrive})

		const {mimeType, name} = await getFileMetadata({fileId, drive: saDrive})
		if (mimeType !== 'application/vnd.google-apps.document') {
			throw new SendableError('File submitted is not document', {
				status: httpStatus.BAD_REQUEST,
				errorCode: errorCodes.BAD_FILE_TYPE,
			})
		}

		let fieldsNames: string[] = fieldsOptions.map(
			(one: BlueprintField) => one.name
		)

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
			ctx.body = await createBlueprint({
				fileId,
				isSubmitted,
				fileName:
					chosenName || name || moment().format('DD. MM. YYYY - HH:MM:SS'),
				user,
				dbClient,
				fields,
			})
			ctx.status = httpStatus.CREATED
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

const updateBlueprintSchema = new Schema({
	blueprintId: {
		type: String,
		required: true,
	},
	name: {
		type: String,
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

router.put(
	blueprintsRoutes.updateBlueprint,
	validateBodyMiddleware(updateBlueprintSchema),
	withValidUserWithCustomerMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUserWithCustomer(ctx)
		const dbClient = extractDbClient(ctx)
		const {blueprintId, name, fieldsOptions} = ctx.request.body

		const blueprintToUpdate = await getBlueprintById({
			blueprintId,
			dbClient,
			customerId: user.selectedCustomer.customerId,
		})

		if (!blueprintToUpdate) {
			throw new SendableError(
				'Blueprint was not updated. Make sure it exists and you have the correct permissions',
				{
					status: httpStatus.OK,
					errorCode: NOT_DELETED,
				}
			)
		}

		if (
			blueprintToUpdate.owner.email !== user.email &&
			!user.selectedCustomer.permissions.canModifyAllBlueprints
		) {
			throw new SendableError('Insufficient permissions', {
				status: httpStatus.FORBIDDEN,
				errorCode: FORBIDDEN,
			})
		}

		ctx.body = await updateBlueprint({
			blueprintId,
			isSubmitted: true,
			fileName: name,
			dbClient,
			fields: fieldsOptions,
			user,
		})

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
