import httpStatus from 'http-status-codes'
import Router from 'koa-router'
import * as blueprintsGroupsUrls from '../../../../constants/api/blueprintsGroups'
import {
	extractUserWithCustomer,
	withValidUserWithCustomerMiddleware,
} from '../../../utils/auth'
import {extractDbClient, withDataDbMiddleware} from '../../../dbService'
import {BlueprintGroup} from '../../../../constants/models/BlueprintsGroup'
import {deleteBlueprintGroup, getGroup} from '../db'
import SendableError from '../../../utils/SendableError'
import {FORBIDDEN, NOT_FOUND} from '../../../../constants/errorCodes'

const router = new Router()

router.delete(
	blueprintsGroupsUrls.deleteBlueprintGroup,
	withValidUserWithCustomerMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUserWithCustomer(ctx)
		const dbClient = extractDbClient(ctx)
		const {groupId} = ctx.params
		const group: BlueprintGroup | null = await getGroup({
			dbClient,
			groupId,
			customerId: user.selectedCustomer.customerId,
		})

		if (!group) {
			throw new SendableError('Group not found', {
				status: httpStatus.NOT_MODIFIED,
				errorCode: NOT_FOUND,
			})
		}

		if (
			group.owner.email !== user.email &&
			!user.selectedCustomer.permissions.canModifyAllBlueprintsGroups
		) {
			throw new SendableError('Insufficient permissions', {
				status: httpStatus.FORBIDDEN,
				errorCode: FORBIDDEN,
			})
		}

		await deleteBlueprintGroup({dbClient, blueprintGroupId: group.id})
		ctx.body = group.id

		await next()
	}
)

export default router
