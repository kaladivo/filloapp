import Router from 'koa-router'
import Schema from 'validate'
import * as authRoutes from '../../../constants/api/auth'
import {createOrUpdateUser} from './db'
import {withDataDbMiddleware} from '../../dbService'
import {createJwtForUser, withValidUserMiddleware} from '../../utils/auth'
import validateBodyMiddleware from '../../utils/validateBodyMiddleware'
import {accessTokenToUser} from './utils'

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

		console.log(googleAccessToken)

		const {accessToken, userData, email} = await accessTokenToUser(
			googleAccessToken
		)

		const user = await createOrUpdateUser({
			accessToken,
			email,
			userData,
			dbClient,
		})

		ctx.body = {bearer: await createJwtForUser(user)}
		await next()
	}
)

router.get(authRoutes.checkUser, withValidUserMiddleware, async (ctx, next) => {
	ctx.status = 200
	await next()
})

export default router
