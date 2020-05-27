import HttpStatus from 'http-status-codes'
import {Context, Next} from 'koa'
import {google} from 'googleapis'
import {UNAUTHORIZED} from '../../constants/errorCodes'
import User from '../../constants/User'
import SendableError from './SendableError'

const CLIENT_ID = String(process.env.GOOGLEAPIS_CLIENT_ID)
const CLIENT_SECRET = String(process.env.GOOGLEAPIS_CLIENT_SECRET)
const CALLBACK_URI = String(process.env.GOOGLEAPIS_CALLBACK_URI)

function getAuth(user: User) {
	const oauth2Client = new google.auth.OAuth2(
		CLIENT_ID,
		CLIENT_SECRET,
		CALLBACK_URI
	)
	oauth2Client.setCredentials({access_token: user.googleAccessToken})
	return oauth2Client
}

export async function withDriveApi(ctx: Context, next: Next) {
	const {user} = ctx.state
	if (!user) {
		throw new SendableError('No user', {
			errorCode: UNAUTHORIZED,
			status: HttpStatus.UNAUTHORIZED,
		})
	}

	const auth = getAuth(user)

	const drive = google.drive({version: 'v3', auth})
	ctx.state.drive = drive

	await next()
}

export async function withGoogleDocsApi(ctx: Context, next: Next) {
	const {user} = ctx.state
	if (!user) {
		throw new SendableError('No user', {
			errorCode: UNAUTHORIZED,
			status: HttpStatus.UNAUTHORIZED,
		})
	}

	const auth = getAuth(user)

	const docs = google.docs({version: 'v1', auth})
	ctx.state.docs = docs

	await next()
}
