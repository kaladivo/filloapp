import {Context, Next} from 'koa'
import jwt from 'jsonwebtoken'

const secret = process.env.SERVER_SECRET || 'secret'
const publicUrl = process.env.JWT_ISS || 'smlouvy-web'

export interface User {
	username: string
}

export async function createJwtForUser({username}: {username: string}) {
	const token = await jwt.sign({}, secret, {
		subject: username,
		issuer: publicUrl,
		expiresIn: '1 day',
	})
	return token
}

export async function withValidUserMiddleware(ctx: Context, next: Next) {
	try {
		const {authorization} = ctx.request.headers
		const bearer = authorization.replace('Bearer ', '')
		const decoded: any = await jwt.verify(bearer, secret, {issuer: publicUrl})

		if (!decoded) {
			throw new Error('Unauthorized')
		}

		const {sub: username} = decoded
		const user: User = {username}
		ctx.state.user = user
	} catch (e) {
		ctx.status = 401
		return
	}
	await next()
}
