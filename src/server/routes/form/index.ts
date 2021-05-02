import Router from 'koa-router'
import {generateFilesFromData} from '../../../constants/api/forms'
import {withValidUserMiddleware} from '../../utils/auth'
// @ts-ignore
// eslint-disable-next-line
import {createFilesFromRequest} from './utils'
import sentry from '../../utils/sentry'

const router = new Router()

router.post(
	generateFilesFromData,
	withValidUserMiddleware,
	async (ctx, next) => {
		const {files, keyMap} = ctx.request.body
		try {
			ctx.body = await createFilesFromRequest({keyMap, files})
		} catch (e) {
			sentry.captureException(e)
			console.error('Unable to generate files from request', e)
			ctx.status = 500
			return
		}
		await next()
	}
)

export default router
