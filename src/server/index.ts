import Koa from 'koa'
import path from 'path'

import Router from 'koa-router'
import json from 'koa-json'
import logger from 'koa-logger'
import bodyParser from 'koa-bodyparser'
import send from 'koa-send'
import serve from 'koa-static'
import {UNKNOWN} from '../constants/errorCodes'

import rootRouter from './routes'
import SendableError from './utils/SendableError'
import {setupSentry} from './utils/sentry'

const app = new Koa()
const appRouter = new Router()

setupSentry(app)

// handle errors
app.use(async (context, next) => {
	try {
		await next()
	} catch (e) {
		console.warn('Request returned error', e)
		if (e instanceof SendableError) {
			e.fillResponse(context.response)
		} else {
			context.body = {message: e.message, errorCode: UNKNOWN}
			context.status = 500
			throw e
		}
	}
})

if (process.env.NODE_ENV !== 'development') {
	app.use(serve(path.join(__dirname, '../public')))

	// Fallback serve index.html from all paths that does not bellong to api
	appRouter.get(/^(?!\/api)/, async (ctx, next) => {
		await send(ctx, 'public/index.html', {root: path.join(__dirname, '..')})
		await next()
	})
}

app.use(logger())
app.use(json())
app.use(bodyParser())

appRouter.use(rootRouter.routes())
app.use(appRouter.routes()).use(appRouter.allowedMethods())

const PORT = process.env.SERVER_PORT || process.env.PORT || 3000
console.info('🔥  Api is listening on ', PORT)
app.listen(PORT)
