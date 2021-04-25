import Router from 'koa-router'
import httpStatus from 'http-status-codes'
import * as blueprintsGroupsUrls from '../../../../constants/api/blueprintsGroups'
import validateBodyMiddleware from '../../../utils/validateBodyMiddleware'
import {
	extractUserWithCustomer,
	withValidUserWithCustomerMiddleware,
} from '../../../utils/auth'
import {extractDbClient, withDataDbMiddleware} from '../../../dbService'
import {BlueprintGroup} from '../../../../constants/models/BlueprintsGroup'
import {getGroup, listSubmits, modifyBlueprintGroup} from '../db'
import SendableError from '../../../utils/SendableError'
import {FORBIDDEN, NOT_FOUND} from '../../../../constants/errorCodes'
import createOrEditGroupSchema from '../utils/createOrEditGroupSchema'

const router = new Router()

router.put(
	blueprintsGroupsUrls.editBlueprint,
	validateBodyMiddleware(createOrEditGroupSchema),
	withValidUserWithCustomerMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUserWithCustomer(ctx)
		const dbClient = extractDbClient(ctx)
		const {name, blueprintsIds} = ctx.request.body
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
			!user.selectedCustomer.permissions.canModifyAllBlueprintsGroups
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

		await modifyBlueprintGroup({
			dbClient,
			blueprintsGroupId: groupId,
			blueprintsIds,
			name,
		})

		ctx.body = {
			...(await getGroup({
				groupId,
				dbClient,
				customerId: user.selectedCustomer.userCustomerId,
			})),
			submits,
		}
		await next()
	}
)

export default router
