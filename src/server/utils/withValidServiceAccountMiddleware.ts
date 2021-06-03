import {Context, Next} from 'koa'
import {SHA3} from 'sha3'
import {extractDbClient} from '../dbService'
import SendableError from './SendableError'
import {EXPECTED_SERVER_ERROR, UNAUTHORIZED} from '../../constants/errorCodes'

function getHash(value: string) {
	const hash = new SHA3(224)
	hash.update(value)
	return hash.digest('hex')
}

const unauthorizedError = new SendableError('Unauthorized', {
	errorCode: UNAUTHORIZED,
	status: 401,
})

async function withValidServiceAccountMiddleware(ctx: Context, next: Next) {
	const dbClient = extractDbClient(ctx)
	if (!dbClient)
		throw new SendableError(
			'withValidServiceAccount middleware requires dbClient in context. Make sure to include withDbClient middleware before this one.',
			{
				errorCode: EXPECTED_SERVER_ERROR,
				status: 500,
				payload: {
					message:
						'withValidServiceAccount middleware requires dbClient in context. Make sure to include withDbClient middleware before this one.',
				},
			}
		)

	const accessToken = ctx.request.get('Authorization') || ''
	const bearer = accessToken.replace('Bearer', '')

	if (!bearer) throw unauthorizedError

	const bearerHash = getHash(bearer)

	const existingServiceAccount = await dbClient.query(
		`
    select id 
    from service_account
    where access_token_hash = $1
  `,
		[bearerHash]
	)

	if (existingServiceAccount.rowCount !== 1) {
		throw new SendableError('Unauthorized', {
			errorCode: UNAUTHORIZED,
			status: 401,
		})
	}

	await next()
}

export default withValidServiceAccountMiddleware
