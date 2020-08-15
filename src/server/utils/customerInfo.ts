import {Next, Context} from 'koa'
import {CustomerInfo} from '../../constants/models/customerInfo'

export async function withCustomerInfoMiddleware(ctx: Context, next: Next) {
	const customerInfo: CustomerInfo = {
		priceLimit: {
			limit: 200000,
			fieldName: 'Order_Price_VAT',
			alertEmail: 'kaladivo@gmail.com',
		},
		entityFields: {
			disabledFields: [
				'Supplier_DIC',
				'Supplier_ICO',
				'Supplier_Name',
				'Supplier_Office',
			],
			suppliersList: [
				{
					name: 'cd1',
					'Supplier_DIC': 'dic1',
					'Supplier_ICO': 'ico: 1',
					'Supplier_Name': 'name1',
					'Supplier_Office': 'office1',
				},
				{
					name: 'cd2',
					'Supplier_DIC': 'dic2',
					'Supplier_ICO': 'ico: 2',
					'Supplier_Name': 'name2',
					'Supplier_Office': 'office2',
				},
			],
		},
		projectsList: ['project1', 'project2', 'other'],
	}
	ctx.state.customerInfo = customerInfo

	await next()
}

export function extractCustomerInfo(ctx: Context): CustomerInfo {
	return ctx.state.customerInfo
}
