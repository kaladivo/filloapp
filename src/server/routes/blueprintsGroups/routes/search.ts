import Router from 'koa-router'
import httpStatus from 'http-status-codes'
import * as blueprintsGroupsUrls from '../../../../constants/api/blueprintsGroups'
import {
	extractUserWithCustomer,
	withValidUserWithCustomerMiddleware,
} from '../../../utils/auth'
import withPaginationMiddleware, {
	extractPagination,
} from '../../../utils/withPaginationMiddleware'
import {extractDbClient, withDataDbMiddleware} from '../../../dbService'
import SendableError from '../../../utils/SendableError'
import errorCodes from '../../../../constants/errorCodes'
import {searchBlueprintsGroups} from '../db'

const router = new Router()

router.get(
	blueprintsGroupsUrls.search,
	withValidUserWithCustomerMiddleware,
	withPaginationMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUserWithCustomer(ctx)
		const dbClient = extractDbClient(ctx)
		const pagination = extractPagination(ctx)
		const {query} = ctx.request.query

		if (!query) {
			throw new SendableError('Missing query', {
				status: httpStatus.BAD_REQUEST,
				errorCode: errorCodes.BAD_BODY,
			})
		}

		ctx.body = await searchBlueprintsGroups({
			user,
			pagination,
			query,
			customerWide: user.selectedCustomer.permissions.canSeeAllBlueprintsGroups,
			dbClient,
		})

		await next()
	}
)

export default router
