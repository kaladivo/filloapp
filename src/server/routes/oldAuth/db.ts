import {PoolClient} from 'pg'

export async function getUser({
	username,
	dbClient,
}: {
	username: string
	dbClient: PoolClient
}): Promise<{username: string; password: string}> {
	const userResult = await dbClient.query(
		`
        select *
        from users
        where username = $1
    `,
		[username]
	)

	if (userResult.rows.length === 0) throw new Error('Bad credentials')
	const userInDb = userResult.rows[0]

	return userInDb
}

export async function createUser({
	username,
	password,
	dbClient,
}: {
	username: string
	password: string
	dbClient: PoolClient
}) {
	await dbClient.query(
		`
        insert into users (username, password)
        values ($1, $2)
    `,
		[username, password]
	)
}
