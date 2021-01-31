import {Next, Context} from 'koa'
import {CustomerInfo} from '../../constants/models/customerInfo'
import {extractUserWithCustomer} from './auth'
import {extractDbClient} from '../dbService'

export async function withCustomerInfoMiddleware(ctx: Context, next: Next) {
	const dataDb = extractDbClient(ctx)
	const user = extractUserWithCustomer(ctx)

	console.log(user)

	const result = await dataDb.query(
		`
              select info
              from customer
              where customer.id = $1
    `,
		[user.selectedCustomer.customerId]
	)

	// eslint-disable-next-line prefer-destructuring
	ctx.state.customerInfo = result.rows[0].info

	await next()
}

export function extractCustomerInfo(ctx: Context): CustomerInfo {
	return ctx.state.customerInfo
}
