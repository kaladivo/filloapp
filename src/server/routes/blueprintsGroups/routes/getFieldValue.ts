import Router from 'koa-router'
import * as blueprintsGroupsUrls from '../../../../constants/api/blueprintsGroups'
import {
	extractUserWithCustomer,
	withValidUserWithCustomerMiddleware,
} from '../../../utils/auth'
import {extractDbClient, withDataDbMiddleware} from '../../../dbService'
import {nextIdFieldValue} from '../db'

const router = new Router()

router.get(
	blueprintsGroupsUrls.getFieldValue,
	withValidUserWithCustomerMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const dbClient = extractDbClient(ctx)
		const user = extractUserWithCustomer(ctx)

		const {fieldType} = ctx.params

		const nextValue = await nextIdFieldValue({
			fieldType,
			customerId: user.selectedCustomer.customerId,
			dbClient,
		})

		ctx.body = {
			...nextValue,
			compiledValue: nextValue.template.replace(
				`{{${nextValue.name}}}`,
				nextValue.newValue
			),
		}
		await next()
	}
)

export default router
