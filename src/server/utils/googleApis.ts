import HttpStatus from 'http-status-codes'
import {Context, Next} from 'koa'
import {
	google,
	drive_v3 as driveV3,
	docs_v1 as docsV1,
	sheets_v4 as sheetsV4,
} from 'googleapis'
import {UNAUTHORIZED} from '../../constants/errorCodes'
import SendableError from './SendableError'
import {extractUser} from './auth'

const CLIENT_ID = String(process.env.GOOGLEAPIS_CLIENT_ID)
const CLIENT_SECRET = String(process.env.GOOGLEAPIS_CLIENT_SECRET)
const CALLBACK_URI = String(process.env.GOOGLEAPIS_CALLBACK_URI)

export function getOAuth2Client({
	accessToken,
	refreshToken,
}: {
	accessToken?: string
	refreshToken?: string
}) {
	const oauth2Client = new google.auth.OAuth2(
		CLIENT_ID,
		CLIENT_SECRET,
		CALLBACK_URI
	)
	oauth2Client.setCredentials({
		access_token: accessToken,
		refresh_token: refreshToken,
	})
	return oauth2Client
}

export async function withDriveApiMiddleware(ctx: Context, next: Next) {
	const user = extractUser(ctx)
	if (!user) {
		throw new SendableError('No user', {
			errorCode: UNAUTHORIZED,
			status: HttpStatus.UNAUTHORIZED,
		})
	}

	const auth = getOAuth2Client({accessToken: user.googleAccessToken})

	const drive = google.drive({version: 'v3', auth})
	ctx.state.drive = drive

	await next()
}
export function extractDriveApi(ctx: Context): driveV3.Drive {
	return ctx.state.drive
}

export async function withSheetsApiMiddleware(ctx: Context, next: Next) {
	const user = extractUser(ctx)
	if (!user) {
		throw new SendableError('No user', {
			errorCode: UNAUTHORIZED,
			status: HttpStatus.UNAUTHORIZED,
		})
	}

	const auth = getOAuth2Client({accessToken: user.googleAccessToken})

	const sheets = google.sheets({version: 'v4', auth})
	ctx.state.sheets = sheets

	await next()
}

export function extractSheetsApi(ctx: Context): sheetsV4.Sheets {
	return ctx.state.sheets
}

export async function withGoogleDocsApiMiddleware(ctx: Context, next: Next) {
	const user = extractUser(ctx)
	if (!user) {
		throw new SendableError('No user', {
			errorCode: UNAUTHORIZED,
			status: HttpStatus.UNAUTHORIZED,
		})
	}

	const auth = getOAuth2Client({accessToken: user.googleAccessToken})

	const docs = google.docs({version: 'v1', auth})
	ctx.state.docs = docs

	await next()
}

export function extractGoogleDocsApi(ctx: Context): docsV1.Docs {
	return ctx.state.docs
}
