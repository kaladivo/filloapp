import Router from 'koa-router'
import {
	withCustomerInfoMiddleware,
	extractCustomerInfo,
} from '../../utils/customerInfo'
import * as customerInfoUrls from '../../../constants/api/customerInfo'
import {withValidUserMiddleware} from '../../utils/auth'
import {withDataDbMiddleware} from '../../dbService'

const router = new Router()

router.get(
	customerInfoUrls.getCustomerInfo,
	withDataDbMiddleware,
	withValidUserMiddleware,
	withCustomerInfoMiddleware,
	async (ctx, next) => {
		const customerInfo = extractCustomerInfo(ctx)

		ctx.body = customerInfo
		await next()
	}
)

export default router
