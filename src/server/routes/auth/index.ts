import Router from 'koa-router'
import {google} from 'googleapis'
import {UNAUTHORIZED} from 'http-status-codes'
import Schema from 'validate'
import * as errorCodes from '../../../constants/errorCodes'
import * as authRoutes from '../../../constants/api/auth'
import {createOrUpdateUser} from './db'
import {withDataDbMiddleware} from '../../dbService'
import SendableError from '../../utils/SendableError'
import {createJwtForUser} from '../../utils/auth'
import validateBodyMiddleware from '../../utils/validateBodyMiddleware'

async function codeToUser(code: string) {
	try {
		const oauth2Client = new google.auth.OAuth2(
			'252011438258-43ahfvm02k4dhhlqhd8cfjqqg0gaabv1.apps.googleusercontent.com',
			'sCSw2vRT4WSnv7zWgiP7bNtO',
			'http://localhost:3000'
		)

		const {tokens} = await oauth2Client.getToken(code)
		const {access_token: accessToken, refresh_token: refreshToken} = tokens
		console.log(tokens)

		if (!accessToken) {
			throw new SendableError('Unable to retrieve access token', {
				status: 403,
				errorCode: errorCodes.UNABLE_TO_GET_USER_INFO,
			})
		}
		oauth2Client.setCredentials({
			access_token: accessToken,
			refresh_token: refreshToken,
		})

		const {data: userData} = await google
			.oauth2({auth: oauth2Client, version: 'v2'})
			.userinfo.get()

		if (!userData.email) {
			throw new SendableError("Unable to retrieve user' s email", {
				status: UNAUTHORIZED,
				errorCode: errorCodes.UNABLE_TO_GET_USER_INFO,
			})
		}

		return {
			accessToken,
			refreshToken: refreshToken || undefined,
			email: userData.email,
			userData,
		}
	} catch (e) {
		if (e instanceof SendableError) throw e
		throw new SendableError('Unable to get user info from google api', {
			status: UNAUTHORIZED,
			errorCode: errorCodes.UNABLE_TO_GET_USER_INFO,
			payload: {
				googleApiMessage: e.message,
			},
		})
	}
}

async function accessTokenToUser(googleAccessToken: string) {
	try {
		const oauth2Client = new google.auth.OAuth2(
			'252011438258-43ahfvm02k4dhhlqhd8cfjqqg0gaabv1.apps.googleusercontent.com',
			'sCSw2vRT4WSnv7zWgiP7bNtO',
			'http://localhost:3000'
		)

		oauth2Client.setCredentials({
			access_token: googleAccessToken,
		})

		const {data: userData} = await google
			.oauth2({auth: oauth2Client, version: 'v2'})
			.userinfo.get()

		if (!userData.email) {
			throw new SendableError("Unable to retrieve user' s email", {
				status: UNAUTHORIZED,
				errorCode: errorCodes.UNABLE_TO_GET_USER_INFO,
			})
		}

		return {
			accessToken: googleAccessToken,
			email: userData.email,
			userData,
		}
	} catch (e) {
		if (e instanceof SendableError) throw e
		throw new SendableError('Unable to get user info from google api', {
			status: UNAUTHORIZED,
			errorCode: errorCodes.UNABLE_TO_GET_USER_INFO,
			payload: {
				googleApiMessage: e.message,
			},
		})
	}
}

const router = new Router()

const loginSchema = new Schema({
	code: {
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
		const {code} = ctx.request.body

		const {accessToken, refreshToken, userData, email} = await codeToUser(code)

		const user = await createOrUpdateUser({
			accessToken,
			refreshToken,
			email,
			userData,
			dbClient,
		})

		ctx.body = {bearer: await createJwtForUser(user)}
		await next()
	}
)

const refreshSchema = new Schema({
	googleAccessToken: {
		type: String,
		required: true,
	},
})
router.post(
	authRoutes.refresh,
	validateBodyMiddleware(refreshSchema),
	withDataDbMiddleware,
	async (ctx, next) => {
		const {dbClient} = ctx.state
		const {googleAccessToken} = ctx.request.body

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

export default router
