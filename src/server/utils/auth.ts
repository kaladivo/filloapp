import {google} from 'googleapis'
import {Context, Next} from 'koa'
import jwt from 'jsonwebtoken'
import {UNAUTHORIZED} from '../../constants/errorCodes'
import User from '../../constants/User'
import SendableError from './SendableError'

const secret = process.env.SERVER_SECRET || 'secret'
const publicUrl = process.env.JWT_ISS || 'https://filloapp.cz'

const CLIENT_ID = String(process.env.GOOGLEAPIS_CLIENT_ID)
const CLIENT_SECRET = String(process.env.GOOGLEAPIS_CLIENT_SECRET)
const CALLBACK_URI = String(process.env.GOOGLEAPIS_CALLBACK_URI)

export async function createJwtForUser(user: User) {
	const token = await jwt.sign(user, secret, {
		subject: user.email,
		issuer: publicUrl,
		expiresIn: '10 days',
	})
	return token
}

export async function checkGoogleAccessToken(googleAccessToken: string) {
	const oauth2Client = new google.auth.OAuth2(
		CLIENT_ID,
		CLIENT_SECRET,
		CALLBACK_URI
	)

	oauth2Client.setCredentials({
		access_token: googleAccessToken,
	})

	try {
		await google.oauth2({auth: oauth2Client, version: 'v2'}).userinfo.get()
		return true
	} catch (e) {
		return false
	}
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
			customer,
		} = (await jwt.verify(bearer, secret)) as any

		if (
			!email ||
			!domain ||
			!googleAccessToken ||
			!additionalInfo ||
			!(await checkGoogleAccessToken(googleAccessToken))
		) {
			throw new Error('Unauthorized')
		}

		const user: User = {
			email,
			domain,
			googleAccessToken,
			customerAdmin,
			additionalInfo,
			customer,
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

export function extractUser(ctx: Context): User {
	return ctx.state.user
}
