import {PoolClient} from 'pg'
import User from '../../../constants/User'
import SendableError from '../../utils/SendableError'
import {NO_CUSTOMER_FOR_EMAIL} from '../../../constants/errorCodes'

export async function doesUserExists({
	email,
	dbClient,
}: {
	email: string
	dbClient: PoolClient
}) {
	const result = await dbClient.query(
		`
        select count(*) > 0 as exists from "user" where email = $1
    `,
		[email]
	)

	return result.rows[0].exists
}

function getDomainFromEmail(email: string) {
	const split = email.split('@')
	if (split.length !== 2) throw new Error('Bad email')
	return split[1]
}

export async function getCustomerForEmail({
	email,
	dbClient,
}: {
	email: string
	dbClient: PoolClient
}): Promise<{id: string; name: string} | null> {
	const result = await dbClient.query(
		`
        select id, name
        from customer
        left join domain on customer.id = domain.customer_id
        where domain = $1
    `,
		[getDomainFromEmail(email)]
	)

	return result.rows.length > 0 ? result.rows[0] : null
}

async function updateUser({
	accessToken,
	refreshToken,
	userData,
	email,
	dbClient,
}: {
	accessToken: string
	refreshToken?: string
	userData: any
	email: string
	dbClient: PoolClient
}) {
	if (refreshToken) {
		await dbClient.query(
			`
            update "user"
            set 
                google_access_token = $1,
                google_refresh_token= $2,
                additional_info = $3
            where email = $4
        `,
			[accessToken, refreshToken, userData, email]
		)
	} else {
		await dbClient.query(
			`
            update "user"
            set 
                google_access_token = $1,
                additional_info= $2
            where email = $3
        `,
			[accessToken, userData, email]
		)
	}
}

async function createUser({
	accessToken,
	refreshToken,
	userData,
	email,
	dbClient,
}: {
	accessToken: string
	refreshToken?: string
	userData: any
	email: string
	dbClient: PoolClient
}) {
	console.log('creating inside')
	await dbClient.query(
		`
        insert into "user" (email, domain, google_access_token, google_refresh_token, additional_info)
        values ($1, $2, $3, $4, $5)
    `,
		[email, getDomainFromEmail(email), accessToken, refreshToken, userData]
	)
}

async function getUser({
	email,
	dbClient,
}: {
	email: string
	dbClient: PoolClient
}): Promise<User | null> {
	const result = await dbClient.query(
		`
		select 
			u.email,
			u.domain,
			u.google_access_token,
			u.customer_admin,
			u.additional_info,
			json_build_object('id', customer.id, 'name', customer.name) as customer
        from "user" u
		left join domain on u.domain = domain.domain
		left join customer on domain.customer_id = customer.id
		where email = $1
    `,
		[email]
	)

	if (result.rows.length === 0) return null

	const [userFromDb] = result.rows

	return {
		email: userFromDb.email,
		domain: userFromDb.domain,
		googleAccessToken: userFromDb.google_access_token,
		customerAdmin: userFromDb.customer_admin,
		additionalInfo: userFromDb.additional_info,
		customer: userFromDb.customer,
	}
}

export async function createOrUpdateUser({
	accessToken,
	refreshToken,
	userData,
	email,
	dbClient,
}: {
	accessToken: string
	refreshToken?: string
	userData: any
	email: string
	dbClient: PoolClient
}): Promise<User> {
	const userExists = await doesUserExists({email, dbClient})
	if (userExists) {
		await updateUser({accessToken, refreshToken, userData, email, dbClient})
	} else {
		console.log('getting mail')
		if (!(await getCustomerForEmail({email, dbClient}))) {
			throw new SendableError('There is no customer for user email', {
				errorCode: NO_CUSTOMER_FOR_EMAIL,
				status: 403,
			})
		}
		console.log('creating')
		await createUser({accessToken, refreshToken, userData, email, dbClient})
		console.log('done')
	}

	const user = await getUser({email, dbClient})
	if (!user) throw new Error('Unable to create user')

	return user
}
