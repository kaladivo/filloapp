import ExtendableError from 'extendable-error'
import {Response} from 'koa'
import {UNKNOWN, ErrorCode} from '../../constants/errorCodes'

export default class SendableError extends ExtendableError {
	readonly status: number = 500
	readonly payload: any = {}
	readonly errorCode: ErrorCode = UNKNOWN

	constructor(
		message: string,
		{
			status,
			payload,
			errorCode,
		}: {status: number; payload?: any; errorCode: ErrorCode}
	) {
		super(message)
		this.status = status
		this.payload = payload || {}
		this.errorCode = errorCode
	}

	fillResponse(response: Response) {
		response.status = this.status
		response.body = {
			message: this.message,
			errorCode: this.errorCode,
			...this.payload,
		}
	}
}
