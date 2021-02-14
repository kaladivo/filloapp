import {PoolClient} from 'pg'
import User from '../../../constants/User'
import SendableError from '../../utils/SendableError'
import errorCodes, {USER_DOES_NOT_EXIST} from '../../../constants/errorCodes'
import Customer from '../../../constants/models/Customer'

export async function doesUserExists({
	email,
	dbClient,
}: {
	email: string
	dbClient: PoolClient
}) {
	const result = await dbClient.query(
		`
              select count(*) > 0 as exists
              from "user"
              where email = $1
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
              set google_access_token = $1,
                  additional_info     = $2
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
              select u.email,
                     u.google_access_token,
                     u.additional_info,
                     jsonb_agg(
                             jsonb_build_object('id', c.id, 'name', c.name, 'permissions', uc.permissions)) as customers
              from "user" u
                       left join user_customer uc on u.email = uc.user_email
                       left join customer c on uc.customer_id = c.id
              where u.email = $1
              group by u.email, u.google_access_token, u.customer_admin, u.additional_info
    `,
		[email]
	)

	if (result.rows.length === 0) return null

	const [userFromDb] = result.rows

	return {
		email: userFromDb.email,
		googleAccessToken: userFromDb.google_access_token,
		additionalInfo: userFromDb.additional_info,
		selectedCustomer: undefined,
	}
}

export async function checkIfUserExistsAndUpdate({
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
		throw new SendableError('user does not exists', {
			errorCode: USER_DOES_NOT_EXIST,
			status: 404,
		})
	}

	await updateUser({accessToken, userData, email, dbClient})

	const user = await getUser({email, dbClient})
	if (!user) throw new Error('Unable to get updated user')

	return user
}

export async function getCustomersOfUser({
	email,
	dbClient,
}: {
	email: string
	dbClient: PoolClient
}): Promise<Customer[]> {
	const result = await dbClient.query(
		`
              select c.name,
                     c.id  as "customerId",
                     uc.id as "userCustomerId",
                     uc.permissions
              from "user" u
                       left join user_customer uc on u.email = uc.user_email
                       left join customer c on uc.customer_id = c.id
              where u.email = $1
    `,
		[email]
	)

	// this should not happen
	if (result.rows.length === 0)
		throw new SendableError('No customer assigned to user', {
			status: 500,
			errorCode: errorCodes.UNKNOWN,
		})
	return result.rows
}

export async function getCustomerForUser({
	email,
	customerId,
	dbClient,
}: {
	email: string
	customerId: string
	dbClient: PoolClient
}): Promise<Customer> {
	const customer = await dbClient.query(
		`
              select uc.permissions,
                     c.name,
                     c.id  as "customerId",
                     uc.id as "userCustomerId"
              from user_customer uc
                       left join customer c on uc.customer_id = c.id
              where uc.user_email = $1
                and uc.customer_id = $2
    `,
		[email, customerId]
	)

	if (customer.rows.length === 0) {
		throw new SendableError('User does not belong to specified customer', {
			status: 400,
			errorCode: errorCodes.USER_DOES_NOT_BELONG_TO_SPECIFIED_CUSTOMER,
		})
	}
	return customer.rows[0]
}
