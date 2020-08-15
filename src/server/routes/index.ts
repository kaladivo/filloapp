import Router from 'koa-router'
import auth from './auth'
import form from './form'
import blueprints from './blueprints'
import blueprintsGroups from './blueprintsGroups'
import customerInfo from './customerInfo'

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

router.use(auth.routes(), auth.allowedMethods())
router.use(form.routes(), form.allowedMethods())
router.use(blueprints.routes(), blueprints.allowedMethods())
router.use(blueprintsGroups.routes(), blueprintsGroups.allowedMethods())
router.use(customerInfo.routes(), customerInfo.allowedMethods())

export default router
