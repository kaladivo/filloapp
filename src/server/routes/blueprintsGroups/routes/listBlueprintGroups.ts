import Router from 'koa-router'
import * as blueprintsGroupsUrls from '../../../../constants/api/blueprintsGroups'
import {
	extractUserWithCustomer,
	withValidUserWithCustomerMiddleware,
} from '../../../utils/auth'
import withPaginationMiddleware, {
	extractPagination,
} from '../../../utils/withPaginationMiddleware'
import {extractDbClient, withDataDbMiddleware} from '../../../dbService'
import {listBlueprintsGroups} from '../db'

const router = new Router()

router.get(
	blueprintsGroupsUrls.listBlueprintGroup,
	withValidUserWithCustomerMiddleware,
	withPaginationMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUserWithCustomer(ctx)
		const dbClient = extractDbClient(ctx)
		const pagination = extractPagination(ctx)

		ctx.body = await listBlueprintsGroups({
			user,
			pagination,
			customerWide: user.selectedCustomer.permissions.canSeeAllBlueprintsGroups,
			dbClient,
		})

		await next()
	}
)

export default router
