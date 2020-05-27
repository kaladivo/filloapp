import {PoolClient} from 'pg'
import httpStatus from 'http-status-codes'
import Schema from 'validate'
import Router from 'koa-router'
import moment from 'moment'
import {NOT_DELETED} from '../../../constants/errorCodes'
import * as errorCodes from '../../../constants/errorCodes'
import * as blueprintsRoutes from '../../../constants/api/blueprints'
import validateBodyMiddleware from '../../utils/validateBodyMiddleware'
import {withValidUserMiddleware} from '../../utils/auth'
import {withDriveApi} from '../../utils/googleApis'
import {getBlueprintFields, getFileMetadata} from './utils'
import SendableError from '../../utils/SendableError'
import {
	createOrUpdateBlueprint,
	listBlueprintsForUser,
	listBlueprintsForCustomer,
	deleteBlueprint,
} from './db'
import {withDataDbMiddleware} from '../../dbService'
import User from '../../../constants/User'

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
	withDriveApi,
	withDataDbMiddleware,
	async (ctx, next) => {
		const {drive, user, dbClient} = ctx.state
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
	blueprintsRoutes.listBlueprints,
	withValidUserMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const {user, dbClient}: {user: User; dbClient: PoolClient} = ctx.state
		const {limit = 10, skip = 0} = ctx.request.query

		if (user.customerAdmin) {
			ctx.body = await listBlueprintsForCustomer({
				dbClient,
				user,
				pagination: {
					limit,
					skip,
				},
			})
		} else {
			ctx.body = await listBlueprintsForUser({
				dbClient,
				user,
				pagination: {
					limit,
					skip,
				},
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
		const {user, dbClient}: {user: User; dbClient: PoolClient} = ctx.state
		const {blueprintId} = ctx.params

		const deleted = await deleteBlueprint({
			dbClient,
			user,
			blueprintId,
		})

		if (!deleted) {
			throw new SendableError(
				'Blueprint was not deleted. Make sure it exists and you have the correct permissions',
				{
					status: 400,
					errorCode: NOT_DELETED,
				}
			)
		}
		ctx.body = {deleted: blueprintId}

		await next()
	}
)

export default router
