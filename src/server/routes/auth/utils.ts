import {google} from 'googleapis'
import statusCodes from 'http-status-codes'
import SendableError from '../../utils/SendableError'
import * as errorCodes from '../../../constants/errorCodes'

const CLIENT_ID = String(process.env.GOOGLEAPIS_CLIENT_ID)
const CLIENT_SECRET = String(process.env.GOOGLEAPIS_CLIENT_SECRET)
const CALLBACK_URI = String(process.env.GOOGLEAPIS_CALLBACK_URI)

export async function codeToUser(code: string) {
	try {
		const oauth2Client = new google.auth.OAuth2(
			CLIENT_ID,
			CLIENT_SECRET,
			CALLBACK_URI
		)

		const {tokens, ...rest} = await oauth2Client.getToken(code)
		const {access_token: accessToken, refresh_token: refreshToken} = tokens

		console.log(tokens, rest)

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
				status: statusCodes.UNAUTHORIZED,
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
			status: statusCodes.UNAUTHORIZED,
			errorCode: errorCodes.UNABLE_TO_GET_USER_INFO,
			payload: {
				googleApiMessage: e.message,
			},
		})
	}
}

export async function accessTokenToUser(googleAccessToken: string) {
	try {
		const oauth2Client = new google.auth.OAuth2(
			CLIENT_ID,
			CLIENT_SECRET,
			CALLBACK_URI
		)

		oauth2Client.setCredentials({
			access_token: googleAccessToken,
		})

		const {data: userData} = await google
			.oauth2({auth: oauth2Client, version: 'v2'})
			.userinfo.get()

		if (!userData.email) {
			throw new SendableError("Unable to retrieve user' s email", {
				status: statusCodes.UNAUTHORIZED,
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
			status: statusCodes.UNAUTHORIZED,
			errorCode: errorCodes.UNABLE_TO_GET_USER_INFO,
			payload: {
				googleApiMessage: e.message,
			},
		})
	}
}
