import Router from 'koa-router'

const router = new Router()

// TO SOLVE
/* 
 - [ ] Login with 
 - [ ] Read file & generate fields


*/

router.get('/test', async (ctx, next) => {
	ctx.body = {test: 'test'}
	await next()
})

export default router
