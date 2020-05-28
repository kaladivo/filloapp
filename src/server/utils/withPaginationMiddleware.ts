import {Context, Next} from 'koa'
import httpStatus from 'http-status-codes'
import errorCodes from '../../constants/errorCodes'
import SendableError from './SendableError'

async function withPaginationMiddleware(ctx: Context, next: Next) {
	const {limit: rawLimit = 10, skip: rawSkip = 0} = ctx.request.query
	const limit = Number(rawLimit)
	const skip = Number(rawSkip)

	if (isNaN(limit) || isNaN(skip)) {
		throw new SendableError('Pagination data must be numbers', {
			status: httpStatus.BAD_REQUEST,
			errorCode: errorCodes.BAD_PAGINATION,
		})
	}

	ctx.state.pagination = {limit, skip}
	await next()
}

export function extractPagination(ctx: Context) {
	return ctx.state.pagination
}

export default withPaginationMiddleware
