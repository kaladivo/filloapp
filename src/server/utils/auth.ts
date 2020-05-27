import {Context, Next} from 'koa'
import jwt from 'jsonwebtoken'
import {UNAUTHORIZED} from '../../constants/errorCodes'
import User from '../../constants/User'
import SendableError from './SendableError'

const secret = process.env.SERVER_SECRET || 'secret'
const publicUrl = process.env.JWT_ISS || 'https://filloapp.cz'

export async function createJwtForUser(user: User) {
	const token = await jwt.sign(user, secret, {
		subject: user.email,
		issuer: publicUrl,
		expiresIn: '1 hour',
	})
	return token
}

export async function withValidUserMiddleware(ctx: Context, next: Next) {
	try {
		const {authorization} = ctx.request.headers
		const bearer = authorization.replace('Bearer ', '')
		const {
			email,
			domain,
			googleAccessToken,
			customerAdmin,
			additionalInfo,
		} = (await jwt.verify(bearer, secret)) as any

		if (!email || !domain || !googleAccessToken || !additionalInfo) {
			throw new Error('Unauthorized')
		}

		const user: User = {
			email,
			domain,
			googleAccessToken,
			customerAdmin,
			additionalInfo,
		}
		ctx.state.user = user
	} catch (e) {
		throw new SendableError('Unauthorized', {
			status: 401,
			errorCode: UNAUTHORIZED,
		})
	}
	await next()
}
