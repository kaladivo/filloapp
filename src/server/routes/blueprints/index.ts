import httpStatus from 'http-status-codes'
import Schema from 'validate'
import Router from 'koa-router'
import moment from 'moment'
import {FORBIDDEN, NOT_DELETED} from '../../../constants/errorCodes'

import * as errorCodes from '../../../constants/errorCodes'
import * as blueprintsRoutes from '../../../constants/api/blueprints'
import validateBodyMiddleware from '../../utils/validateBodyMiddleware'
import {withValidUserMiddleware, extractUser} from '../../utils/auth'
import {withDriveApiMiddleware, extractDriveApi} from '../../utils/googleApis'
import {getBlueprintFields, getFileMetadata} from './utils'
import SendableError from '../../utils/SendableError'
import {
	createOrUpdateBlueprint,
	listBlueprintsForUser,
	listBlueprintsForCustomer,
	deleteBlueprint,
	getBlueprintById,
	searchBlueprintsForCustomer,
	searchBlueprintsForUser,
	listTinyBlueprintsForCustomer,
	listTinyBlueprintsForUser,
} from './db'
import {withDataDbMiddleware, extractDbClient} from '../../dbService'
import withPaginationMiddleware, {
	extractPagination,
} from '../../utils/withPaginationMiddleware'

const router = new Router()

const createBlueprintSchema = new Schema({
	fileId: {
		type: String,
		required: true,
	},
})

router.post(
	blueprintsRoutes.createBlueprint,
	validateBodyMiddleware(createBlueprintSchema),
	withValidUserMiddleware,
	withDriveApiMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const drive = extractDriveApi(ctx)
		const user = extractUser(ctx)
		const dbClient = extractDbClient(ctx)
		const {fileId} = ctx.request.body

		const {mimeType, name} = await getFileMetadata({fileId, drive})
		if (mimeType !== 'application/vnd.google-apps.document') {
			throw new SendableError('File submitted is not document', {
				status: httpStatus.BAD_REQUEST,
				errorCode: errorCodes.BAD_FILE_TYPE,
			})
		}

		let fields
		try {
			fields = await getBlueprintFields({
				fileId: ctx.request.body.fileId,
				drive,
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

		try {
			const createdBlueprint = await createOrUpdateBlueprint({
				fileId,
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
	blueprintsRoutes.searchBlueprint,
	withValidUserMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUser(ctx)
		const dbClient = extractDbClient(ctx)

		const {query} = ctx.request.query

		if (!query) {
			throw new SendableError('Missing query', {
				status: httpStatus.BAD_REQUEST,
				errorCode: errorCodes.BAD_BODY,
			})
		}

		if (user.customerAdmin) {
			ctx.body = await searchBlueprintsForCustomer({
				dbClient,
				query,
				customerId: user.customer.id,
			})
		} else {
			ctx.body = await searchBlueprintsForUser({
				dbClient,
				query,
				user,
			})
		}
		await next()
	}
)

router.get(
	blueprintsRoutes.getBlueprint,
	withValidUserMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUser(ctx)
		const dbClient = extractDbClient(ctx)
		const {blueprintId} = ctx.params

		const blueprint = await getBlueprintById({
			blueprintId,
			dbClient,
			customerId: user.customer.id,
		})

		if (!blueprint) {
			throw new SendableError('Blueprint was not found.', {
				status: httpStatus.NOT_FOUND,
				errorCode: errorCodes.NOT_FOUND,
			})
		}

		if (blueprint.owner.email !== user.email && !user.customerAdmin) {
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
	withValidUserMiddleware,
	withPaginationMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUser(ctx)
		const dbClient = extractDbClient(ctx)
		const pagination = extractPagination(ctx)

		if (user.customerAdmin) {
			ctx.body = await listBlueprintsForCustomer({
				dbClient,
				customerId: user.customer.id,
				pagination,
			})
		} else {
			ctx.body = await listBlueprintsForUser({
				dbClient,
				user,
				pagination,
			})
		}
		await next()
	}
)

router.get(
	blueprintsRoutes.listBlueprintsTiny,
	withValidUserMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUser(ctx)
		const dbClient = extractDbClient(ctx)

		if (user.customerAdmin) {
			ctx.body = await listTinyBlueprintsForCustomer({
				dbClient,
				customerId: user.customer.id,
			})
		} else {
			ctx.body = await listTinyBlueprintsForUser({
				dbClient,
				user,
			})
		}
		await next()
	}
)

router.delete(
	blueprintsRoutes.deleteBlueprint,
	withValidUserMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUser(ctx)
		const dbClient = extractDbClient(ctx)
		const {blueprintId} = ctx.params

		const blueprintToDelete = await getBlueprintById({
			blueprintId,
			dbClient,
			customerId: user.customer.id,
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

		if (blueprintToDelete.owner.email !== user.email && !user.customerAdmin) {
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
