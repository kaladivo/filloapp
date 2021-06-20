import Router from 'koa-router'
import sleep from 'sleep-promise'
import auth from './auth'
import form from './form'
import blueprints from './blueprints'
import blueprintsGroups from './blueprintsGroups'
import customerInfo from './customerInfo'
import envInfo from './envInfo'
import ares from './ares'
import service from './service'
import contactForm from './contactForm'
import {withValidUserWithCustomerMiddleware} from '../utils/auth'
import sentry from '../utils/sentry'

const router = new Router()

router.prefix(process.env.REACT_APP_API || '/api')

router.get('/', async (ctx, next) => {
	ctx.body = {
		message: '😇 Api is up and running 🤩 🤩',
		currentEnvironment: process.env.NODE_ENV,
		version: process.env.VERSION,
	}
	await next()
})

router.get('/test-sentry', withValidUserWithCustomerMiddleware, async (ctx) => {
	await sleep(3000)
	const traceId = ctx.request.get('X-Sentry-Trace-Id')
	const clientVersion = ctx.request.get('X-Client-Version')

	sentry.captureException(new Error('exception to capture'))
	sentry.captureMessage(
		`message to capture. Trace id: ${traceId}, Client version: ${clientVersion}`
	)
	sentry.captureEvent({message: 'event to capture'})

	throw new Error('Sentry test error')
})

router.use(auth.routes(), auth.allowedMethods())
router.use(form.routes(), form.allowedMethods())
router.use(blueprints.routes(), blueprints.allowedMethods())
router.use(blueprintsGroups.routes(), blueprintsGroups.allowedMethods())
router.use(customerInfo.routes(), customerInfo.allowedMethods())
router.use(envInfo.routes(), envInfo.allowedMethods())
router.use(ares.routes(), ares.allowedMethods())
router.use(service.routes(), service.allowedMethods())
router.use(contactForm.routes(), contactForm.allowedMethods())

export default router
