import Router from 'koa-router'
import {submitContactForm} from '../../../constants/api/contactForm'
import sendMail from '../../utils/sendMail'

const router = new Router()

router.post(submitContactForm, async (ctx, next) => {
	const data = ctx.request.body

	if (!data.mail && !data.name && !data.phoneNumber && !data.message) {
		ctx.body = 'ko'
		return
	}

	await sendMail({
		to: String(process.env.ADMIN_EMAIL),
		html: `
	  Submitted form:
	  <br>
	  name: <b>${data.name || 'none'}</b>
	  <br>
	  email: <b>${data.mail || 'none'}</b>
	  <br>
	  phone number: <b>${data.phoneNumber || 'none'}</b>
	  <br>
	  message: <b>${data.message || 'none'}</b>
	`,
		subject: 'User submitted fillo contact form',
	})

	ctx.body = 'ok'

	await next()
})

export default router
