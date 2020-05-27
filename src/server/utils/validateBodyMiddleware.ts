import {Context, Next} from 'koa'
import HttpStatus from 'http-status-codes'
import Schema from 'validate'
import {BAD_BODY} from '../../constants/errorCodes'
import SendableError from './SendableError'

export default (schema: Schema) => async (ctx: Context, next: Next) => {
	const errors = schema.validate(ctx.request.body)
	if (errors.length > 0) {
		throw new SendableError('BAD BODY', {
			errorCode: BAD_BODY,
			status: HttpStatus.BAD_REQUEST,
			payload: errors.map((error) => ({
				path: error.path,
				//  @ts-ignore message field exists. Errors seem to be badly typed
				message: error.message,
			})),
		})
	} else {
		await next()
	}
}
