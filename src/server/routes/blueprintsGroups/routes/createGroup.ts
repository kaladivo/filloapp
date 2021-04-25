import unique from 'array-unique'
import httpStatus from 'http-status-codes'
import Router from 'koa-router'
import * as blueprintsGroupsUrls from '../../../../constants/api/blueprintsGroups'
import {
	extractUserWithCustomer,
	withValidUserWithCustomerMiddleware,
} from '../../../utils/auth'
import validateBodyMiddleware from '../../../utils/validateBodyMiddleware'
import {extractDbClient, withDataDbMiddleware} from '../../../dbService'
import {checkIfUserHasAccessToBlueprints, createGroup} from '../db'
import SendableError from '../../../utils/SendableError'
import {FORBIDDEN, UNKNOWN} from '../../../../constants/errorCodes'
import createOrEditGroupSchema from '../utils/createOrEditGroupSchema'

const router = new Router()

router.post(
	blueprintsGroupsUrls.createGroup,
	withValidUserWithCustomerMiddleware,
	validateBodyMiddleware(createOrEditGroupSchema),
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUserWithCustomer(ctx)
		const dbClient = extractDbClient(ctx)

		// TODO - Allow project name to be null in table
		const {name, projectName = ''} = ctx.request.body
		const blueprintsIds: string[] = unique(ctx.request.body.blueprintsIds)

		if (
			!(await checkIfUserHasAccessToBlueprints({user, blueprintsIds, dbClient}))
		) {
			throw new SendableError('Insufficient permissions', {
				status: httpStatus.FORBIDDEN,
				errorCode: FORBIDDEN,
			})
		}

		try {
			ctx.body = await createGroup({
				blueprintsIds,
				name,
				user,
				projectName,
				dbClient,
			})
			if (!ctx.body) {
				throw new Error('Not created for some reason. Should not happen')
			}
			await next()
		} catch (e) {
			throw new SendableError(
				'Unable to create blueprint',
				{
					status: httpStatus.INTERNAL_SERVER_ERROR,
					errorCode: UNKNOWN,
				},
				{error: e}
			)
		}
	}
)

export default router
