import * as Sentry from '@sentry/node'
import Koa, {Context, Next} from 'koa'
import {Transaction} from '@sentry/types'
import * as domain from 'domain'

const {stripUrlQueryAndFragment} = require('@sentry/tracing')

const SENTRY_DSN = process.env.SERVER_SENTRY_DSN
const TRACES_SAMPLE_RATE = Number(
	process.env.SERVER_SENTRY_TRACES_SAMPLE_RATE || 0
)
const {VERSION, ENVIRONMENT} = process.env

Sentry.init({
	dsn: SENTRY_DSN,
	tracesSampleRate: TRACES_SAMPLE_RATE,
	release: VERSION,
	environment: ENVIRONMENT,
})

function requestHandler(ctx: Context, next: Next) {
	const traceId = ctx.request.get('X-Sentry-Trace-Id')
	const clientVersion = ctx.request.get('X-Client-Version')

	return new Promise((resolve) => {
		const local = domain.create()
		// @ts-ignore
		local.add(ctx)
		local.on('error', (err: any) => {
			ctx.status = err.status || 500
			ctx.body = err.message
			ctx.app.emit('error', err, ctx)
		})
		local.run(async () => {
			Sentry.getCurrentHub().configureScope((scope) => {
				scope.addEventProcessor((event) =>
					Sentry.Handlers.parseRequest(event, ctx.request, {user: false})
				)
				scope.setTag('traceId', traceId)
				scope.setTag('clientVersion', clientVersion)
			})
			await next()
			resolve()
		})
	})
}

// this tracing middleware creates a transaction per request
async function tracingMiddleWare(ctx: Context, next: Next) {
	const reqMethod = (ctx.method || '').toUpperCase()
	const reqUrl = ctx.url && stripUrlQueryAndFragment(ctx.url)
	const traceId = ctx.request.get('X-Sentry-Trace-Id')

	const transaction = Sentry.startTransaction({
		name: `${reqMethod} ${reqUrl}`,
		op: 'http.server',
		tags: {traceId},
	})

	Sentry.getCurrentHub().configureScope((scope) => {
		scope.setSpan(transaction)
	})
	ctx.state.sentryTransaction = transaction
	try {
		await next()
	} catch (e) {
		Sentry.captureException(e)
	} finally {
		// if using koa router, a nicer way to capture transaction using the matched route
		if (ctx._matchedRoute) {
			const mountPath = ctx.mountPath || ''
			transaction.setName(`${reqMethod} ${mountPath}${ctx._matchedRoute}`)
		}
		transaction.setHttpStatus(ctx.status)
		transaction.finish()
	}
}

export function setupSentry(app: Koa) {
	app.use(requestHandler)
	app.use(tracingMiddleWare)
}

export function extractSentryTransaction(ctx: Context): Transaction {
	return ctx.state.sentryTransaction
}

const sentry = Sentry
export default sentry
