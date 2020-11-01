import {PoolClient} from 'pg'
import User from '../../../constants/User'
import SendableError from '../../utils/SendableError'
import {USER_DOES_NOT_EXIST} from '../../../constants/errorCodes'

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

async function updateUser({
	accessToken,
	userData,
	email,
	dbClient,
}: {
	accessToken: string
	userData: any
	email: string
	dbClient: PoolClient
}) {
	await dbClient.query(
		`
            update "user"
            set 
                google_access_token = $1,
                additional_info = $2
            where email = $3
        `,
		[accessToken, userData, email]
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
			u.google_access_token,
			u.customer_admin,
			u.additional_info,
			json_build_object('id', customer.id, 'name', customer.name) as customer
        from "user" u
		left join customer on u.customer_id = customer.id
		where email = $1
    `,
		[email]
	)

	if (result.rows.length === 0) return null

	const [userFromDb] = result.rows

	return {
		email: userFromDb.email,
		googleAccessToken: userFromDb.google_access_token,
		customerAdmin: userFromDb.customer_admin,
		additionalInfo: userFromDb.additional_info,
		customer: userFromDb.customer,
	}
}

export async function createOrUpdateUser({
	accessToken,
	userData,
	email,
	dbClient,
}: {
	accessToken: string
	userData: any
	email: string
	dbClient: PoolClient
}): Promise<User> {
	const userExists = await doesUserExists({email, dbClient})
	if (!userExists) {
		throw new SendableError('There is no customer for user email', {
			errorCode: USER_DOES_NOT_EXIST,
			status: 403,
		})
	}

	await updateUser({accessToken, userData, email, dbClient})

	const user = await getUser({email, dbClient})
	if (!user) throw new Error('Unable to get updated user')

	return user
}
