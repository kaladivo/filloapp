import {PoolClient} from 'pg'
import {Blueprint, TinyBlueprint} from '../../../constants/models/Blueprint'
import {PaginationPosition} from '../../../constants/models/Pagination'

import {UserWithSelectedCustomer} from '../../../constants/User'

export interface InputBlueprintField {
	name: string
	type: string
	displayName: string
	helperText: string | null
	options: {}
}

async function getBlueprintByFileIdAndUser({
	fileId,
	dbClient,
	user,
}: {
	fileId: string
	dbClient: PoolClient
	user: UserWithSelectedCustomer
}): Promise<Blueprint | null> {
	const result = await dbClient.query(
		`
              select blueprint.id,
                     google_docs_id                                                 as "googleDocsId",
                     blueprint.name,
                     blueprint.is_submitted as "isSubmitted",
                     json_agg(json_build_object('id', blueprint_field.id, 'name', blueprint_field.name, 'type',
                                                blueprint_field.type, 'displayName', blueprint_field.display_name,
                                                'helperText', blueprint_field.helper_text, 'options',
                                                blueprint_field.options))           as fields,
                     json_build_object('email', u.email, 'info', u.additional_info) as owner
              from blueprint
                       left join blueprint_field on blueprint.id = blueprint_field.blueprint_id
                       left join user_customer on blueprint.user_customer_id = user_customer.id
                       left join "user" u on user_customer.user_email = u.email
              where google_docs_id = $1
                and blueprint.user_customer_id = $2
              group by blueprint.id, u.email
    `,
		[fileId, user.selectedCustomer.userCustomerId]
	)
	if (result.rows.length === 0) return null
	return result.rows[0]
}

export async function getBlueprintById({
	blueprintId,
	customerId,
	dbClient,
}: {
	blueprintId: string
	customerId: string
	dbClient: PoolClient
}): Promise<Blueprint | null> {
	const result = await dbClient.query(
		`
              select blueprint.id,
                     google_docs_id                                                 as "googleDocsId",
                     blueprint.name,
                     blueprint.is_submitted                                         as "isSubmitted",
                     json_agg(json_build_object('id', blueprint_field.id, 'name', blueprint_field.name, 'type',
                                                blueprint_field.type, 'displayName', blueprint_field.display_name,
                                                'helperText', blueprint_field.helper_text, 'options',
                                                blueprint_field.options))           as fields,
                     json_build_object('email', u.email, 'info', u.additional_info) as owner
              from blueprint
                       left join blueprint_field on blueprint.id = blueprint_field.blueprint_id
                       left join user_customer on blueprint.user_customer_id = user_customer.id
                       left join "user" u on user_customer.user_email = u.email
                       left join user_customer uc on u.email = uc.user_email
              where blueprint.id = $1::int
                and uc.customer_id = $2
              group by blueprint.id, u.email
    `,
		[blueprintId, customerId]
	)

	console.log(blueprintId, customerId)

	if (result.rows.length === 0) return null
	return result.rows[0]
}

async function createOrUpdateFields({
	fields,
	blueprintId,
	dbClient,
}: {
	fields: InputBlueprintField[]
	blueprintId: string
	dbClient: PoolClient
}) {
	await dbClient.query(
		`
              delete
              from blueprint_field
              where blueprint_id = $1::int
    `,
		[blueprintId]
	)

	await dbClient.query(
		`
		insert into blueprint_field (blueprint_id, name, type, display_name, helper_text, options) values
			${fields
				.map(
					(field, index) =>
						`($1::int, $${index * 5 + 2}, $${index * 5 + 3}, $${
							index * 5 + 4
						}, $${index * 5 + 5}, $${index * 5 + 6})`
				)
				.join(', ')}
	`,
		[
			Number(blueprintId),
			...fields.reduce<(string | null)[]>(
				(prev, current) => [
					...prev,
					current.name,
					current.type,
					current.displayName,
					current.helperText,
					JSON.stringify(current.options || {}),
				],
				[]
			),
		]
	)
}

export async function canUserUpdateBlueprint({
	blueprintId,
	user,
	dbClient,
}: {
	blueprintId: string
	user: UserWithSelectedCustomer
	dbClient: PoolClient
}) {
	const {rows} = await dbClient.query(
		`
		select uc.id as "userCustomerId"
		from blueprint
		left join user_customer uc on blueprint.user_customer_id = uc.id
		where blueprint.id = $1 and uc.id = $2
	`,
		[blueprintId, user.selectedCustomer.customerId]
	)

	if (rows.length) return false
	const author = rows[0].userCustomerId
	if (author === user.selectedCustomer.userCustomerId) return true
	return user.selectedCustomer.permissions.canModifyAllBlueprintsGroups
}

export async function updateBlueprint({
	blueprintId,
	isSubmitted,
	fileName,
	fields,
	user,
	dbClient,
}: {
	blueprintId: string
	isSubmitted: boolean
	fileName: string
	fields: InputBlueprintField[]
	user: UserWithSelectedCustomer
	dbClient: PoolClient
}): Promise<Blueprint | null> {
	try {
		await dbClient.query(`begin`)
		await dbClient.query(
			`
                update blueprint
                set name = $1, is_submitted = $2
                where id = $3::int
      `,
			[fileName, isSubmitted, blueprintId]
		)
		await createOrUpdateFields({fields, blueprintId, dbClient})

		await dbClient.query(`commit`)
		return await getBlueprintById({
			blueprintId,
			dbClient,
			customerId: user.selectedCustomer.customerId,
		})
	} catch (e) {
		await dbClient.query(`rollback`)
		throw e
	}
}

export async function createBlueprint({
	fileId,
	fileName,
	fields,
	user,
	isSubmitted,
	dbClient,
}: {
	fileId: string
	fileName: string
	isSubmitted: boolean
	fields: InputBlueprintField[]
	user: UserWithSelectedCustomer
	dbClient: PoolClient
}): Promise<Blueprint | null> {
	try {
		await dbClient.query(`begin`)

		await dbClient.query(
			`
                INSERT INTO blueprint (google_docs_id, user_customer_id, name, is_submitted)
                values ($1, $2, $3, $4)
      `,
			[fileId, user.selectedCustomer.userCustomerId, fileName, isSubmitted]
		)
		const blueprint = await getBlueprintByFileIdAndUser({
			fileId,
			user,
			dbClient,
		})
		if (!blueprint) throw new Error('Blueprint not created correctly.')

		await createOrUpdateFields({fields, blueprintId: blueprint.id, dbClient})
		await dbClient.query(`commit`)
		return getBlueprintByFileIdAndUser({fileId, user, dbClient})
	} catch (e) {
		await dbClient.query(`rollback`)
		throw e
	}
}

export async function listBlueprints({
	pagination,
	dbClient,
	user,
	customerWide,
	onlySubmitted,
}: {
	pagination: PaginationPosition
	dbClient: PoolClient
	user: UserWithSelectedCustomer
	customerWide: boolean
	onlySubmitted: boolean
}) {
	const result = await dbClient.query(
		`
              select blueprint.id,
                     blueprint.name,
                     blueprint.is_submitted as "isSubmitted",
                     json_agg(json_build_object('id', blueprint_field.id, 'name', blueprint_field.name, 'type',
                                                blueprint_field.type, 'displayName', blueprint_field.display_name,
                                                'helperText', blueprint_field.helper_text, 'options',
                                                blueprint_field.options))           as fields,
                     json_build_object('email', u.email, 'info', u.additional_info) as owner
              from blueprint
                       left join blueprint_field on blueprint.id = blueprint_field.blueprint_id
                       left join user_customer on blueprint.user_customer_id = user_customer.id
                       left join "user" u on user_customer.user_email = u.email
              where ${
								customerWide ? 'user_customer.customer_id' : 'user_customer.id'
							} = $1
             	${onlySubmitted ? 'and blueprint.is_submitted = true' : ''}
              group by blueprint.id, u.email, blueprint.name
              order by blueprint.name
              limit $2 offset $3
    `,
		[
			customerWide
				? user.selectedCustomer.customerId
				: user.selectedCustomer.userCustomerId,
			pagination.limit,
			pagination.skip,
		]
	)

	return result.rows
}

export async function searchBlueprints({
	dbClient,
	query,
	user,
	customerWide,
	onlySubmitted,
}: {
	dbClient: PoolClient
	query: string
	user: UserWithSelectedCustomer
	customerWide: boolean
	onlySubmitted: boolean
}) {
	const result = await dbClient.query(
		`
              select blueprint.id,
                     blueprint.name,
                     blueprint.is_submitted as "isSubmitted",
                     json_agg(json_build_object('id', blueprint_field.id, 'name', blueprint_field.name, 'type',
                                                blueprint_field.type, 'displayName', blueprint_field.display_name,
                                                'helperText', blueprint_field.helper_text,
                                                blueprint_field.options))           as fields,
                     json_build_object('email', u.email, 'info', u.additional_info) as owner
              from blueprint
                       left join blueprint_field on blueprint.id = blueprint_field.blueprint_id
                       left join user_customer on blueprint.user_customer_id = user_customer.id
                       left join "user" u on user_customer.user_email = u.email
                       left join user_customer uc on u.email = uc.user_email
              where ${
								customerWide ? 'user_customer.customer_id' : 'user_customer.id'
							} = $1
                ${onlySubmitted ? 'and blueprint.is_submitted = true' : ''}
                and lower(blueprint.name) like $2
              group by blueprint.id, u.email, blueprint.name
              order by blueprint.name
    `,
		[
			customerWide
				? user.selectedCustomer.customerId
				: user.selectedCustomer.userCustomerId,
			`${query.toLowerCase()}%`,
		]
	)

	return result.rows
}

export async function deleteBlueprint({
	dbClient,
	blueprintId,
}: {
	dbClient: PoolClient
	blueprintId: string
}) {
	try {
		await dbClient.query(`begin`)
		await dbClient.query(
			`
                delete
                from blueprint_blueprints_group
                where blueprint_id = $1::int
      `,
			[blueprintId]
		)

		await dbClient.query(
			`
                delete
                from blueprint_field
                where blueprint_field.blueprint_id = $1::int
      `,
			[blueprintId]
		)

		console.log('here')

		const resultBlueprint = await dbClient.query(
			`
                delete
                from blueprint
                where blueprint.id = $1::int
      `,
			[blueprintId]
		)
		await dbClient.query(`commit`)
		return resultBlueprint.rowCount > 0
	} catch (e) {
		await dbClient.query(`rollback`)
		throw e
	}
}

export async function listTinyBlueprints({
	user,
	customerWide,
	onlySubmitted,
	dbClient,
}: {
	user: UserWithSelectedCustomer
	customerWide: UserWithSelectedCustomer
	onlySubmitted: boolean
	dbClient: PoolClient
}): Promise<TinyBlueprint[]> {
	const result = await dbClient.query(
		`
              select blueprint.id,
                     blueprint.name,
                     blueprint.is_submitted as "isSubmitted"
              from blueprint
                       left join user_customer uc on blueprint.user_customer_id = uc.id
              where ${customerWide ? 'uc.customer_id' : 'uc.id'} = $1
                ${onlySubmitted ? 'and blueprint.is_submitted = true' : ''}
              and blueprint.is_submitted = true
              order by blueprint.name
    `,
		[
			customerWide
				? user.selectedCustomer.customerId
				: user.selectedCustomer.userCustomerId,
		]
	)
	return result.rows
}

export async function doesBlueprintExist({
	fileId,
	user,
	dbClient,
}: {
	fileId: string
	user: UserWithSelectedCustomer
	dbClient: PoolClient
}) {
	const result = await dbClient.query(
		`
              select count(*) > 0 as exists
              from blueprint
                       left join user_customer uc on blueprint.user_customer_id = uc.id
              where blueprint.google_docs_id = $1
                and user_customer_id = $2
    `,
		[fileId, user.selectedCustomer.userCustomerId]
	)

	return result.rows[0].exists
}
