import unique from 'array-unique'
import httpStatus from 'http-status-codes'
import Schema from 'validate'
import Router from 'koa-router'
import errorCodes, {
	NOT_FOUND,
	FORBIDDEN,
	UNKNOWN,
} from '../../../constants/errorCodes'

import {BlueprintGroup} from '../../../constants/models/BlueprintsGroup'

import {
	createGroup,
	getGroup,
	checkIfUserHasAccessToBlueprints,
	listBlueprintsGroupsForUser,
	listBlueprintsGroupsForCustomer,
	searchUsersBlueprintsGroups,
	deleteBlueprintGroup,
	searchCustomersBlueprintsGroups,
} from './db'
import * as blueprintsGroupsUrls from '../../../constants/api/blueprintsGroups'
import validateBodyMiddleware from '../../utils/validateBodyMiddleware'
import {withValidUserMiddleware, extractUser} from '../../utils/auth'
import {withDataDbMiddleware, extractDbClient} from '../../dbService'
import SendableError from '../../utils/SendableError'
import withPaginationMiddleware, {
	extractPagination,
} from '../../utils/withPaginationMiddleware'

const router = new Router()

router.get(
	blueprintsGroupsUrls.getBlueprintGroup,
	withValidUserMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUser(ctx)
		const dbClient = extractDbClient(ctx)
		const {groupId} = ctx.params
		const group: BlueprintGroup | null = await getGroup({
			dbClient,
			groupId,
			customerId: user.customer.id,
		})
		if (!group) {
			throw new SendableError('Group not found', {
				status: httpStatus.NOT_FOUND,
				errorCode: NOT_FOUND,
			})
		}

		// TODO if user is domain admin

		if (group.owner.email !== user.email && !user.customerAdmin) {
			throw new SendableError('Insufficient permissions', {
				status: httpStatus.FORBIDDEN,
				errorCode: FORBIDDEN,
			})
		}

		ctx.body = group
		await next()
	}
)

const createGroupSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	blueprintsIds: {
		type: Array,
		each: {type: String},
		required: true,
	},
})

router.post(
	blueprintsGroupsUrls.createGroup,
	withValidUserMiddleware,
	validateBodyMiddleware(createGroupSchema),
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUser(ctx)
		const dbClient = extractDbClient(ctx)

		const {name} = ctx.request.body
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
			ctx.body = await createGroup({blueprintsIds, name, user, dbClient})
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

router.get(
	blueprintsGroupsUrls.search,
	withValidUserMiddleware,
	withPaginationMiddleware,
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
			ctx.body = await searchCustomersBlueprintsGroups({
				customerId: user.customer.id,
				query,
				dbClient,
			})
		} else {
			ctx.body = await searchUsersBlueprintsGroups({user, query, dbClient})
		}

		await next()
	}
)

router.get(
	blueprintsGroupsUrls.listBlueprintGroup,
	withValidUserMiddleware,
	withPaginationMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		console.log('here')
		const user = extractUser(ctx)
		const dbClient = extractDbClient(ctx)
		const pagination = extractPagination(ctx)

		if (user.customerAdmin) {
			ctx.body = await listBlueprintsGroupsForCustomer({
				customerId: user.customer.id,
				pagination,
				dbClient,
			})
		} else {
			ctx.body = await listBlueprintsGroupsForUser({user, pagination, dbClient})
		}

		await next()
	}
)

router.delete(
	blueprintsGroupsUrls.deleteBlueprintGroup,
	withValidUserMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUser(ctx)
		const dbClient = extractDbClient(ctx)
		const {groupId} = ctx.params
		const group: BlueprintGroup | null = await getGroup({
			dbClient,
			groupId,
			customerId: user.customer.id,
		})

		if (!group) {
			throw new SendableError('Group not found', {
				status: httpStatus.NOT_MODIFIED,
				errorCode: NOT_FOUND,
			})
		}

		if (group.owner.email !== user.email && !user.customerAdmin) {
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
