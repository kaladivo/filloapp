import ExtendableError from 'extendable-error'
import {Response} from 'koa'
import {UNKNOWN, ErrorCode} from '../../constants/errorCodes'

export default class SendableError extends ExtendableError {
	readonly status: number = 500
	readonly payload: any = {}
	readonly errorCode: ErrorCode = UNKNOWN
	readonly error: Error | undefined = undefined
	readonly description: string | undefined = undefined

	constructor(
		message: string,
		{
			status,
			payload,
			errorCode,
		}: {status: number; payload?: any; errorCode: ErrorCode},
		{error, description}: {error?: Error; description?: string} = {
			error: undefined,
			description: undefined,
		}
	) {
		super(message)
		this.status = status
		this.payload = payload || {}
		this.errorCode = errorCode
		this.error = error
		this.description = description
	}

	fillResponse(response: Response) {
		response.status = this.status
		response.body = {
			message: this.message,
			errorCode: this.errorCode,
			...this.payload,
		}
	}

	logError(logger: (desc: string, any: any) => void) {
		logger('Error description', this.description)
		logger('Error message', this.message)
		logger('Error payload', this.payload)
		logger('Error errorCode', this.errorCode)
		logger('Error error', this.error)
	}
}
