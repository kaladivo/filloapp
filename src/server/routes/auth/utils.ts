import {google} from 'googleapis'
import statusCodes from 'http-status-codes'
import jwt from 'jsonwebtoken'
import SendableError from '../../utils/SendableError'
import * as errorCodes from '../../../constants/errorCodes'
import User from '../../../constants/User'

const secret = process.env.SERVER_SECRET || 'secret'
const publicUrl = process.env.JWT_ISS || 'https://filloapp.cz'

const CLIENT_ID = String(process.env.GOOGLEAPIS_CLIENT_ID)
const CLIENT_SECRET = String(process.env.GOOGLEAPIS_CLIENT_SECRET)
const CALLBACK_URI = String(process.env.GOOGLEAPIS_CALLBACK_URI)

export function generateCorrectPermissions(permissions: any) {
	const generated = {...permissions}

	if (permissions.user) {
		generated.canSeeAllBlueprints = true
	}

	if (permissions.admin) {
		generated.canSeeAllBlueprintsGroupsSubmits = true
		generated.canSeeAllBlueprints = true
		generated.canModifyAllBlueprints = true
		generated.canModifyAllBlueprintsGroups = true
		generated.canSeeAllBlueprintsGroups = true
	}

	return generated
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
			userData: {
				name: userData.name,
				picture: userData.picture,
				locale: userData.locale,
			},
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

export async function createJwtForUser(user: User) {
	return jwt.sign(user, secret, {
		subject: user.email,
		issuer: publicUrl,
		expiresIn: '10 days',
	})
}
