import Router from 'koa-router'
import auth from './auth'
import form from './form'
import googleapis from './googleapis'
import test from './test'

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
router.use(googleapis.routes(), googleapis.allowedMethods())
router.use(test.routes(), test.allowedMethods())

export default router
