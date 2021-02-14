import {google} from 'googleapis'
import {Context, Next} from 'koa'
import jwt from 'jsonwebtoken'
import errorCodes, {UNAUTHORIZED} from '../../constants/errorCodes'
import User, {UserWithSelectedCustomer} from '../../constants/User'
import SendableError from './SendableError'

const secret = process.env.SERVER_SECRET || 'secret'
// const publicUrl = process.env.JWT_ISS || 'https://filloapp.cz'

const CLIENT_ID = String(process.env.GOOGLEAPIS_CLIENT_ID)
const CLIENT_SECRET = String(process.env.GOOGLEAPIS_CLIENT_SECRET)
const CALLBACK_URI = String(process.env.GOOGLEAPIS_CALLBACK_URI)

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

export async function extractAndValidateBearerFromHeader({
	authorizationHeader,
	validateAccessToken,
}: {
	authorizationHeader: string
	validateAccessToken: boolean
}): Promise<User> {
	try {
		const bearer = authorizationHeader.replace('Bearer ', '')
		const {
			email,
			googleAccessToken,
			additionalInfo,
			selectedCustomer,
		} = (await jwt.verify(bearer, secret)) as any

		if (
			!email ||
			!googleAccessToken ||
			!additionalInfo ||
			(validateAccessToken &&
				!(await checkGoogleAccessToken(googleAccessToken)))
		) {
			throw new Error('Bad bearer')
		}
		return {email, googleAccessToken, additionalInfo, selectedCustomer}
	} catch (e) {
		throw new SendableError('Unauthorized', {
			status: 401,
			errorCode: UNAUTHORIZED,
		})
	}
}

export async function withValidUserMiddleware(ctx: Context, next: Next) {
	ctx.state.user = await extractAndValidateBearerFromHeader({
		authorizationHeader: ctx.request.headers.authorization,
		validateAccessToken: true,
	})
	await next()
}

export function extractUser(ctx: Context): User {
	return ctx.state.user
}

export async function withValidUserWithCustomerMiddleware(
	ctx: Context,
	next: Next
) {
	await withValidUserMiddleware(ctx, () => Promise.resolve())
	const user = extractUser(ctx)
	if (!user.selectedCustomer)
		throw new SendableError('User must have customer selected', {
			status: 400,
			errorCode: errorCodes.USER_MUST_HAVE_CUSTOMER_SELECTED,
		})
	ctx.state.userWithCustomer = user

	await next()
}

export function extractUserWithCustomer(
	ctx: Context
): UserWithSelectedCustomer {
	return ctx.state.userWithCustomer
}
