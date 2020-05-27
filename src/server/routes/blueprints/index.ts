import httpStatus from 'http-status-codes'
import Schema from 'validate'
import Router from 'koa-router'
import moment from 'moment'
import * as errorCodes from '../../../constants/errorCodes'
import * as blueprintsRoutes from '../../../constants/api/blueprints'
import validateBodyMiddleware from '../../utils/validateBodyMiddleware'
import {withValidUserMiddleware} from '../../utils/auth'
import {withDriveApi} from '../../utils/googleApis'
import {getBlueprintFields, getFileMetadata} from './utils'
import SendableError from '../../utils/SendableError'
import {createOrUpdateBlueprint} from './db'
import {withDataDbMiddleware} from '../../dbService'

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
			ctx.body = await createOrUpdateBlueprint({
				fileId,
				fileName: name || moment().format('DD. MM. YYYY - HH:MM:SS'),
				user,
				dbClient,
				fields,
			})
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

export default router
