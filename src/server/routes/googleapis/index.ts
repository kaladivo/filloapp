/* eslint-disable camelcase */
import Router from 'koa-router'
import {google} from 'googleapis'

const SCOPES = [
	'https://www.googleapis.com/auth/documents',
	'https://www.googleapis.com/auth/drive',
]

const credentials = JSON.parse(process.env.GOOGLEAPIS_CREDENTIALS || '{}')

function getClient() {
	const {client_secret, client_id, redirect_uris} = credentials.installed

	return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])
}

const router = new Router()

router.get('/ga/step-1', (ctx) => {
	const oAuth2Client = getClient()
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES,
	})

	ctx.redirect(authUrl)
})

router.get('/ga/step-2', async (ctx) => {
	const {token} = ctx.request.query
	if (!token) {
		ctx.body = 'Make sure to include token at ?token=[token]'
		ctx.state = 400
		return
	}
	const oAuth2Client = getClient()
	ctx.body = await (await oAuth2Client.getToken(token)).res?.data
})

export default router
