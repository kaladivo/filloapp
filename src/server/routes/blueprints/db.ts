import {PoolClient} from 'pg'
import {PaginationPosition} from '../../../constants/models/Pagination'

import {Blueprint} from '../../../constants/models/Blueprint'
import User from '../../../constants/User'

async function getBlueprint({
	fileId,
	dbClient,
	user,
}: {
	fileId: string
	dbClient: PoolClient
	user: User
}): Promise<Blueprint | null> {
	const result = await dbClient.query(
		`
		select 
			blueprint.id, 
			google_docs_id as "googleDocsId", 
			blueprint.name,
			json_agg(json_build_object('id', blueprint_field.id, 'name', blueprint_field.name, 'type', blueprint_field.type)) as fields,
			json_build_object('email', u.email, 'info', u.additional_info) as owner
		from blueprint
			left join blueprint_field on blueprint.id = blueprint_field.blueprint_id
			left join "user" u on blueprint.user_email = u.email
		where google_docs_id = $1 and user_email = $2
		group by blueprint.id, u.email
    `,
		[fileId, user.email]
	)
	if (result.rows.length === 0) return null
	return result.rows[0]
}

async function createOrUpdateFields({
	fields,
	blueprintId,
	dbClient,
}: {
	fields: string[]
	blueprintId: string
	dbClient: PoolClient
}) {
	await dbClient.query(
		`
		delete from blueprint_field
		where blueprint_id = $1::int
	`,
		[blueprintId]
	)

	await dbClient.query(
		`
		insert into blueprint_field (blueprint_id, name, type)
		values
			${fields.map((field, index) => `($1::int, $${index + 2}, 'string')`).join(', ')}
	`,
		[Number(blueprintId), ...fields]
	)
}

async function updateBlueprint({
	fileName,
	fileId,
	blueprintId,
	fields,
	user,
	dbClient,
}: {
	fileId: string
	blueprintId: string
	fileName: string
	fields: string[]
	user: User
	dbClient: PoolClient
}): Promise<Blueprint | null> {
	try {
		await dbClient.query(`begin`)
		await dbClient.query(
			`
		update blueprint
		set 
			name = $1
		where id = $2::int
	`,
			[fileName, blueprintId]
		)
		await createOrUpdateFields({fields, blueprintId, dbClient})

		await dbClient.query(`commit`)
		return await getBlueprint({fileId, dbClient, user})
	} catch (e) {
		await dbClient.query(`rollback`)
		throw e
	}
}

async function createBlueprint({
	fileId,
	fileName,
	fields,
	user,
	dbClient,
}: {
	fileId: string
	fileName: string
	fields: string[]
	user: User
	dbClient: PoolClient
}): Promise<Blueprint | null> {
	try {
		await dbClient.query(`begin`)

		await dbClient.query(
			`
		INSERT INTO blueprint (google_docs_id, user_email, name)
		values ($1, $2, $3)
	`,
			[fileId, user.email, fileName]
		)
		const blueprint = await getBlueprint({fileId, user, dbClient})
		if (!blueprint) throw new Error('Blueprint not created correctly.')

		await createOrUpdateFields({fields, blueprintId: blueprint.id, dbClient})
		await dbClient.query(`commit`)
		return getBlueprint({fileId, user, dbClient})
	} catch (e) {
		await dbClient.query(`rollback`)
		throw e
	}
}

export async function createOrUpdateBlueprint({
	fileId,
	fileName,
	fields,
	dbClient,
	user,
}: {
	fileId: string
	fileName: string
	fields: string[]
	dbClient: PoolClient
	user: User
}): Promise<{blueprint: Blueprint; performedAction: 'update' | 'create'}> {
	let blueprint = await getBlueprint({fileId, dbClient, user})
	let performedAction: 'update' | 'create' = 'update'

	if (!blueprint) {
		blueprint = await createBlueprint({
			fileId,
			dbClient,
			user,
			fields,
			fileName,
		})
		performedAction = 'create'
	} else {
		blueprint = await updateBlueprint({
			blueprintId: blueprint?.id || '0', // this should not happen, because we check for blueprint above
			fileId,
			user,
			fields,
			dbClient,
			fileName,
		})
		performedAction = 'update'
	}

	if (!blueprint) {
		throw new Error('Blueprint is null after creation. This should not happen')
	}

	return {blueprint, performedAction}
}

export async function listBlueprintsForUser({
	pagination,
	dbClient,
	user,
}: {
	pagination: PaginationPosition
	dbClient: PoolClient
	user: User
}) {
	const result = await dbClient.query(
		`
		select
			blueprint.id,
			blueprint.name,
			json_agg(json_build_object('id', blueprint_field.id, 'name', blueprint_field.name, 'type', blueprint_field.type)) as fields,
			json_build_object('email', u.email, 'info', u.additional_info) as owner
		from blueprint
			left join blueprint_field on blueprint.id = blueprint_field.blueprint_id
			left join "user" u on blueprint.user_email = u.email
		where u.email = $1
		group by blueprint.id, u.email
		order by blueprint.name desc
		limit $2 offset $3
	`,
		[user.email, pagination.limit, pagination.skip]
	)

	return result.rows
}

export async function listBlueprintsForCustomer({
	dbClient,
	pagination,
	user,
}: {
	pagination: PaginationPosition
	dbClient: PoolClient
	user: User
}) {
	const result = await dbClient.query(
		`
		select
			blueprint.id,
			blueprint.name,
			json_agg(json_build_object('id', blueprint_field.id, 'name', blueprint_field.name, 'type', blueprint_field.type)) as fields,
			json_build_object('email', u.email, 'info', u.additional_info) as owner
		from blueprint
			left join blueprint_field on blueprint.id = blueprint_field.blueprint_id
			left join "user" u on blueprint.user_email = u.email
			left join domain d on u.domain = d.domain
			left join customer c on d.customer_id = c.id
		where c.id = $1
		group by blueprint.id, u.email, c.id
		order by blueprint.name desc
		limit $2 offset $3
	`,
		[user.customer.id, pagination.limit, pagination.skip]
	)

	return result.rows
}

export async function deleteBlueprint({
	dbClient,
	blueprintId,
	user,
}: {
	dbClient: PoolClient
	blueprintId: string
	user: User
}) {
	await dbClient.query(
		`
		delete
		from blueprint_field bf
		using 
			blueprint left join blueprint_field bf2 on bf2.blueprint_id = blueprint.id,
			"user" left join blueprint b on b.user_email = "user".email,
			domain left join "user" u on u.domain = domain.domain
		where bf.blueprint_id = $4::int and (blueprint.user_email = $1 or ($2 and domain.domain = $3))
	`,
		[user.email, user.customerAdmin, user.domain, blueprintId]
	)

	console.log('here')

	const resultBlueprint = await dbClient.query(
		`
		delete
		from blueprint b
		using 
			"user" left join blueprint b2 on b2.user_email = "user".email,
			domain left join "user" u on u.domain = domain.domain
		where b.id = $4::int and (b.user_email = $1 or ($2 = 'true' and domain.domain = $3))
	`,
		[user.email, user.customerAdmin, user.domain, blueprintId]
	)

	return resultBlueprint.rowCount > 0
}
