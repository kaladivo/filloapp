import Router from 'koa-router'
import bcrypt from 'bcrypt'
import {
	login,
	checkUser,
	createUser as createUserUrl,
} from '../../../constants/api/auth'
import {createUser, getUser} from './db'
import {withDataDbMiddleware} from '../../dbService'
import {createJwtForUser, withValidUserMiddleware} from '../../utils/auth'

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || 10)

const router = new Router()

router.post(login, withDataDbMiddleware, async (ctx, next) => {
	try {
		const {password, username} = ctx.request.body
		const {dbClient} = ctx.state
		const dbUser = await getUser({username, dbClient})
		const passwordValid = await bcrypt.compare(password, dbUser.password)

		if (!passwordValid) {
			throw new Error('Bad credentials')
		}

		ctx.body = {username, accessToken: await createJwtForUser({username})}
		await next()
	} catch (e) {
		ctx.status = 401
		console.log('Error while logging in', e)
	}
})

router.post(
	createUserUrl,
	async (ctx, next) => {
		if (process.env.NODE_ENV === 'development') {
			await next()
			return
		}

		ctx.state = 403
	},
	withDataDbMiddleware,
	async (ctx, next) => {
		const {dbClient} = ctx.state
		const {password, username} = ctx.request.body

		try {
			const hashedPass = await bcrypt.hash(password, SALT_ROUNDS)
			await createUser({username, password: hashedPass, dbClient})
			ctx.body = 200
			await next()
		} catch (e) {
			ctx.body = 'Unable to create user.'
			ctx.status = 400
			console.error(e)
		}
	}
)

router.get(checkUser, withValidUserMiddleware, (ctx) => {
	ctx.body = ctx.state.user
})

export default router
