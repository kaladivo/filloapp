import Router from 'koa-router'
import * as blueprintsGroupsUrls from '../../../../constants/api/blueprintsGroups'
import {
	extractUserWithCustomer,
	withValidUserWithCustomerMiddleware,
} from '../../../utils/auth'
import {extractDbClient, withDataDbMiddleware} from '../../../dbService'
import {
	extractCustomerInfo,
	withCustomerInfoMiddleware,
} from '../../../utils/customerInfo'
import {exportToSpreadsheet} from '../utils'

const router = new Router()

router.post(
	blueprintsGroupsUrls.triggerSpreadsheetExport,
	withValidUserWithCustomerMiddleware,
	withDataDbMiddleware,
	withCustomerInfoMiddleware,
	async (ctx, next) => {
		const dbClient = extractDbClient(ctx)
		const user = extractUserWithCustomer(ctx)
		const customerInfo = extractCustomerInfo(ctx)

		if (!customerInfo.spreadsheetExport) {
			ctx.body = 'No config in customer info for exporting spreadsheets'
			ctx.status = 400
			return
		}

		await exportToSpreadsheet({
			dbClient,
			customerId: user.selectedCustomer.customerId,
			// refreshTokenOfWriter: customerInfo.spreadsheetExport.refreshTokenOfWriter,
			sheetId: customerInfo.spreadsheetExport.spreadsheetId,
		})

		ctx.body = {targetSpreadsheet: customerInfo.spreadsheetExport}
		await next()
	}
)

export default router
