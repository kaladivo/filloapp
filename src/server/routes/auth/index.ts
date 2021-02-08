import Router from 'koa-router'
import Schema from 'validate'
import * as authRoutes from '../../../constants/api/auth'
import {
	checkIfUserExistsAndUpdate,
	getCustomerForUser,
	getCustomersOfUser,
} from './db'
import {extractDbClient, withDataDbMiddleware} from '../../dbService'
import {extractUser, withValidUserMiddleware} from '../../utils/auth'
import validateBodyMiddleware from '../../utils/validateBodyMiddleware'
import {
	accessTokenToUser,
	createJwtForUser,
	generateCorrectPermissions,
} from './utils'
import SendableError from '../../utils/SendableError'
import {NO_CUSTOMER_FOR_EMAIL} from '../../../constants/errorCodes'

const router = new Router()

const loginSchema = new Schema({
	googleAccessToken: {
		type: String,
		required: true,
	},
})

router.post(
	authRoutes.login,
	validateBodyMiddleware(loginSchema),
	withDataDbMiddleware,
	async (ctx, next) => {
		const {dbClient} = ctx.state
		const {googleAccessToken} = ctx.request.body

		const {accessToken, userData, email} = await accessTokenToUser(
			googleAccessToken
		)

		const customers = await getCustomersOfUser({email, dbClient})
		if (customers.length === 0) {
			throw new SendableError('There is no customer assigned to user', {
				errorCode: NO_CUSTOMER_FOR_EMAIL,
				status: 403,
			})
		}

		const user = await checkIfUserExistsAndUpdate({
			accessToken,
			email,
			userData,
			dbClient,
		})

		ctx.body = {
			bearer: await createJwtForUser({
				...user,
				selectedCustomer: customers.length === 1 ? customers[0] : undefined,
			}),
		}
		await next()
	}
)

router.get(authRoutes.checkUser, withValidUserMiddleware, async (ctx, next) => {
	ctx.status = 200
	await next()
})

router.get(
	authRoutes.listUserCustomers,
	withValidUserMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUser(ctx)
		const dbClient = extractDbClient(ctx)

		ctx.body = await getCustomersOfUser({email: user.email, dbClient})
		await next()
	}
)

const selectCustomerSchema = new Schema({
	customerId: {
		type: String,
		required: true,
	},
})

router.post(
	authRoutes.selectCustomer,
	validateBodyMiddleware(selectCustomerSchema),
	withValidUserMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const dbClient = extractDbClient(ctx)
		const user = extractUser(ctx)

		const customer = await getCustomerForUser({
			email: user.email,
			customerId: ctx.request.body.customerId,
			dbClient,
		})

		customer.permissions = generateCorrectPermissions(customer.permissions)

		ctx.body = {
			newBearer: await createJwtForUser({...user, selectedCustomer: customer}),
		}

		await next()
	}
)

export default router
