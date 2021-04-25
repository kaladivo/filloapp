import Router from 'koa-router'
import httpStatus from 'http-status-codes'
import * as blueprintsGroupsUrls from '../../../../constants/api/blueprintsGroups'
import {
	extractUserWithCustomer,
	withValidUserWithCustomerMiddleware,
} from '../../../utils/auth'
import {extractDbClient, withDataDbMiddleware} from '../../../dbService'
import {BlueprintGroup} from '../../../../constants/models/BlueprintsGroup'
import {getGroup, listSubmits} from '../db'
import SendableError from '../../../utils/SendableError'
import {FORBIDDEN, NOT_FOUND} from '../../../../constants/errorCodes'

const router = new Router()

router.get(
	blueprintsGroupsUrls.getBlueprintGroup,
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
				status: httpStatus.NOT_FOUND,
				errorCode: NOT_FOUND,
			})
		}

		// TODO if user is domain admin

		if (
			group.owner.email !== user.email &&
			!user.selectedCustomer.permissions.canSeeAllBlueprintsGroups
		) {
			throw new SendableError('Insufficient permissions', {
				status: httpStatus.FORBIDDEN,
				errorCode: FORBIDDEN,
			})
		}

		const submits = await listSubmits({
			blueprintsGroupId: groupId,
			user,
			customerWide:
				user.selectedCustomer.permissions.canSeeAllBlueprintsGroupsSubmits,
			dbClient,
		})
		const enhancedSubmits = await Promise.all(
			submits.map(async (submit: any) => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const {folderId, ...rest} = submit
				return {
					...rest,
					folderId,
				}
			})
		)

		ctx.body = {...group, submits: enhancedSubmits}
		await next()
	}
)

export default router
