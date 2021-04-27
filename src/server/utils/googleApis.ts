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
const GOOGLE_SHARING_SERVICE_ACCOUNT = JSON.parse(
	String(process.env.GOOGLE_SHARING_SERVICE_ACCOUNT) || '{}'
)

const SERVICE_ACCOUNT_EMAIL = String(process.env.SERVICE_ACCOUNT_EMAIL)

export function getOAuth2ClientForUser({
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

export async function getOauth2ClientForServiceAccount() {
	const client = await google.auth.getClient({
		credentials: GOOGLE_SHARING_SERVICE_ACCOUNT,
		scopes: 'https://www.googleapis.com/auth/drive',
	})
	return client
}

//
//
// FOR USER
//
//

export async function withUserDriveApiMiddleware(ctx: Context, next: Next) {
	const user = extractUser(ctx)
	if (!user) {
		throw new SendableError('No user', {
			errorCode: UNAUTHORIZED,
			status: HttpStatus.UNAUTHORIZED,
		})
	}

	const auth = getOAuth2ClientForUser({accessToken: user.googleAccessToken})

	const drive = google.drive({version: 'v3', auth})
	ctx.state.drive = drive

	await next()
}
export function extractUserDriveApi(ctx: Context): driveV3.Drive {
	return ctx.state.drive
}

export async function withUserSheetsApiMiddleware(ctx: Context, next: Next) {
	const user = extractUser(ctx)
	if (!user) {
		throw new SendableError('No user', {
			errorCode: UNAUTHORIZED,
			status: HttpStatus.UNAUTHORIZED,
		})
	}

	const auth = getOAuth2ClientForUser({accessToken: user.googleAccessToken})

	const sheets = google.sheets({version: 'v4', auth})
	ctx.state.sheets = sheets

	await next()
}

export function extractUserSheetsApi(ctx: Context): sheetsV4.Sheets {
	return ctx.state.sheets
}

export async function withUserGoogleDocsApiMiddleware(
	ctx: Context,
	next: Next
) {
	const user = extractUser(ctx)
	if (!user) {
		throw new SendableError('No user', {
			errorCode: UNAUTHORIZED,
			status: HttpStatus.UNAUTHORIZED,
		})
	}

	const auth = getOAuth2ClientForUser({accessToken: user.googleAccessToken})

	const docs = google.docs({version: 'v1', auth})
	ctx.state.docs = docs

	await next()
}

export function extractUserGoogleDocsApi(ctx: Context): docsV1.Docs {
	return ctx.state.docs
}

// /
// /
// / FOR SERVICE ACCOUNT
// /
// /

export async function withServiceAccountDriveApiMiddleware(
	ctx: Context,
	next: Next
) {
	const auth = await getOauth2ClientForServiceAccount()
	ctx.state.SADrive = google.drive({version: 'v3', auth})

	await next()
}

export function extractDriveApiForServiceAccount(ctx: Context): driveV3.Drive {
	return ctx.state.SADrive
}

export async function withServiceAccountDocsApiMiddleware(
	ctx: Context,
	next: Next
) {
	const auth = await getOauth2ClientForServiceAccount()
	ctx.state.SADocs = google.docs({version: 'v1', auth})

	await next()
}

export function extractDocsApiForServiceAccount(ctx: Context): docsV1.Docs {
	return ctx.state.SADocs
}

export async function withServiceAccountSheetsApiMiddleware(
	ctx: Context,
	next: Next
) {
	const auth = await getOauth2ClientForServiceAccount()
	ctx.state.SASheets = google.sheets({version: 'v4', auth})

	await next()
}

export function extractSheetsApiForServiceAccount(
	ctx: Context
): sheetsV4.Sheets {
	return ctx.state.SASheets
}

export async function hasWriteAccess({
	fileId,
	drive,
}: {
	fileId: string
	drive: driveV3.Drive
}) {
	try {
		// This can be acquired only if drive has write access
		await drive.permissions.list({fileId})
		return true
	} catch (e) {
		return false
	}
}

export async function shareToSA({
	fileId,
	drive,
}: {
	fileId: string
	drive: driveV3.Drive
}) {
	// @ts-ignore This is tested  and works
	await drive.permissions.create({
		fileId,
		sendNotificationEmail: false,
		requestBody: {
			role: 'writer',
			type: 'user',
			emailAddress: SERVICE_ACCOUNT_EMAIL,
		},
	})
}
