import Router from 'koa-router'
import {extractDbClient, withDataDbMiddleware} from '../../dbService'
import withValidServiceAccountMiddleware from '../../utils/withValidServiceAccountMiddleware'
import {deleteCustomer} from './db'

const router = new Router()

router.post(
	'/service/delete-customer/:customerId',
	withDataDbMiddleware,
	withValidServiceAccountMiddleware,
	async (ctx, next) => {
		const dbClient = extractDbClient(ctx)

		const {customerId} = ctx.params
		await deleteCustomer({customerId, dbClient})

		ctx.response.status = 200
		ctx.response.body = 'G! 💪 '

		await next()
	}
)

export default router
