import Router from 'koa-router'
import auth from './auth'
import form from './form'

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

export default router
