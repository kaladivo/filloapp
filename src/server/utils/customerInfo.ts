import {Next, Context} from 'koa'

export interface CustomerInfo {
	priceLimit?: {
		limit: number
		fieldName: string
		alertEmail: string
	}
}

export async function withCustomerInfoMiddleware(ctx: Context, next: Next) {
	ctx.state.customerInfo = {
		priceLimit: {
			limit: 200000,
			fieldName: 'Order_Price_VAT',
			alertEmail: 'kaladivo@gmail.com',
		},
	}

	await next()
}

export function extractCustomerInfo(ctx: Context) {
	return ctx.state.customerInfo
}
