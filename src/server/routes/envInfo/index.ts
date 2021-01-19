import Router from 'koa-router'
import * as envInfoRoutes from '../../../constants/api/envInfo'
import {EnvInfo} from '../../../constants/models/EnvInfo'

const router = new Router()

router.get(envInfoRoutes.getEnvInfo, async (ctx, next) => {
	const envInfo: EnvInfo = {
		googlePickerDeveloperKey: String(process.env.GOOGLE_PICKER_DEVELOPER_KEY),
		googleClientId: String(process.env.GOOGLEAPIS_CLIENT_ID),
		googleScopes: String(process.env.GOOGLE_SCOPES),
		googleSharingServiceAccount: String(process.env.SERVICE_ACCOUNT_EMAIL),
		googleAppId: String(process.env.GOOGLEAPIS_APP_ID),
	}
	ctx.body = envInfo
	await next()
})

export default router
