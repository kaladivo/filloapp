import {Pool, PoolClient} from 'pg'
// @ts-ignore
import onExit from 'signal-exit'
import {Context, Next} from 'koa'

const host = process.env.DB_HOST
const user = process.env.DB_USER
const database = process.env.DB_DATABASE
const password = process.env.DB_PASSWORD
const port = Number(process.env.DB_PORT)
const schema = process.env.DB_SCHEMA
const disableSsl = process.env.DB_SSL === 'disabled'

console.log(`Connecting to pg database`, {
	host,
	port,
	user,
	database,
	password,
	schema,
})

const pool = new Pool({
	host,
	user,
	database,
	password,
	port,
	ssl: disableSsl
		? false
		: {
				rejectUnauthorized: false,
		  },
})

onExit(() => {
	pool.end()
})

export default async function connect(): Promise<PoolClient> {
	const client = await pool.connect()
	await client.query(
		`
        SET search_path='${schema}'
    `
	)

	return client
}

export async function withDataDbMiddleware(ctx: Context, next: Next) {
	const client = await connect()
	ctx.state.dbClient = client

	try {
		await next()
	} finally {
		client.release()
	}
}

export function extractDbClient(ctx: Context): PoolClient {
	return ctx.state.dbClient
}
