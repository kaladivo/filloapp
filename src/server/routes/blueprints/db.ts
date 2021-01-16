import {PoolClient} from 'pg'
import {TinyBlueprint, Blueprint} from '../../../constants/models/Blueprint'
import {PaginationPosition} from '../../../constants/models/Pagination'

import User from '../../../constants/User'

export interface InputBlueprintField {
	name: string
	type: string
	displayName: string
	helperText: string | null
	options: {}
}

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
                select blueprint.id,
                       google_docs_id                                                         as "googleDocsId",
                       blueprint.name,
                       json_agg(json_build_object('id', blueprint_field.id, 'name', blueprint_field.name, 'type',
                                                  blueprint_field.type, 'display_name', blueprint_field.display_name,
                                                  'helperText', blueprint_field.helper_text, 'options', blueprint_field.options)) as fields,
                       json_build_object('email', u.email, 'info', u.additional_info)         as owner
                from blueprint
                         left join blueprint_field on blueprint.id = blueprint_field.blueprint_id
                         left join "user" u on blueprint.user_email = u.email
                where google_docs_id = $1
                  and user_email = $2
                group by blueprint.id, u.email
        `,
		[fileId, user.email]
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
                       google_docs_id                                                         as "googleDocsId",
                       blueprint.name,
                       json_agg(json_build_object('id', blueprint_field.id, 'name', blueprint_field.name, 'type',
                                                  blueprint_field.type, 'display_name', blueprint_field.display_name,
                                                  'helperText', blueprint_field.helper_text, 'options', blueprint_field.options)) as fields,
                       json_build_object('email', u.email, 'info', u.additional_info)         as owner
                from blueprint
                         left join blueprint_field on blueprint.id = blueprint_field.blueprint_id
                         left join "user" u on blueprint.user_email = u.email
                where blueprint.id = $1::int
                  and u.customer_id = $2
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
						}, $${index * 5 + 5}) $${index * 5 + 6}`
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
					JSON.stringify(current.options),
				],
				[]
			),
		]
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
	fields: InputBlueprintField[]
	user: User
	dbClient: PoolClient
}): Promise<Blueprint | null> {
	try {
		await dbClient.query(`begin`)
		await dbClient.query(
			`
                    update blueprint
                    set name = $1
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
	fields: InputBlueprintField[]
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
	fields: InputBlueprintField[]
	dbClient: PoolClient
	user: User
}): Promise<{blueprint: Blueprint; performedAction: 'update' | 'create'}> {
	let blueprint = await getBlueprint({fileId, dbClient, user})
	let performedAction: 'update' | 'create'

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
                select blueprint.id,
                       blueprint.name,
                       json_agg(json_build_object('id', blueprint_field.id, 'name', blueprint_field.name, 'type',
                                                  blueprint_field.type, 'display_name', blueprint_field.display_name,
                                                  'helperText', blueprint_field.helper_text, 'options', blueprint_field.options)) as fields,
                       json_build_object('email', u.email, 'info', u.additional_info)         as owner
                from blueprint
                         left join blueprint_field on blueprint.id = blueprint_field.blueprint_id
                         left join "user" u on blueprint.user_email = u.email
                where u.email = $1
                group by blueprint.id, u.email, blueprint.name
                order by blueprint.name
                limit $2 offset $3
        `,
		[user.email, pagination.limit, pagination.skip]
	)

	return result.rows
}

export async function listBlueprintsForCustomer({
	dbClient,
	pagination,
	customerId,
}: {
	pagination: PaginationPosition
	dbClient: PoolClient
	customerId: string
}) {
	const result = await dbClient.query(
		`
                select blueprint.id,
                       blueprint.name,
                       json_agg(json_build_object('id', blueprint_field.id, 'name', blueprint_field.name, 'type',
                                                  blueprint_field.type, 'display_name', blueprint_field.display_name,
                                                  'helperText', blueprint_field.helper_text, 'options', blueprint_field.options)) as fields,
                       json_build_object('email', u.email, 'info', u.additional_info)         as owner
                from blueprint
                         left join blueprint_field on blueprint.id = blueprint_field.blueprint_id
                         left join "user" u on blueprint.user_email = u.email
                         left join customer c on u.customer_id = c.id
                where c.id = $1
                group by blueprint.id, u.email, c.id, blueprint.name
                order by blueprint.name
                limit $2 offset $3
        `,
		[customerId, pagination.limit, pagination.skip]
	)

	return result.rows
}

export async function searchBlueprintsForCustomer({
	dbClient,
	query,
	customerId,
}: {
	dbClient: PoolClient
	query: string
	customerId: string
}) {
	const result = await dbClient.query(
		`
                select blueprint.id,
                       blueprint.name,
                       json_agg(json_build_object('id', blueprint_field.id, 'name', blueprint_field.name, 'type',
                                                  blueprint_field.type, 'display_name', blueprint_field.display_name,
                                                  'helperText', blueprint_field.helper_text, blueprint_field.options)) as fields,
                       json_build_object('email', u.email, 'info', u.additional_info)         as owner
                from blueprint
                         left join blueprint_field on blueprint.id = blueprint_field.blueprint_id
                         left join "user" u on blueprint.user_email = u.email
                         left join customer c on u.customer_id = c.id
                where c.id = $1
                  and lower(blueprint.name) like $2
                group by blueprint.id, u.email, c.id, blueprint.name
                order by blueprint.name
        `,
		[customerId, `${query.toLowerCase()}%`]
	)

	return result.rows
}

export async function searchBlueprintsForUser({
	dbClient,
	query,
	user,
}: {
	dbClient: PoolClient
	query: string
	user: User
}) {
	const result = await dbClient.query(
		`
                select blueprint.id,
                       blueprint.name,
                       json_agg(json_build_object('id', blueprint_field.id, 'name', blueprint_field.name, 'type',
                                                  blueprint_field.type, 'display_name', blueprint_field.display_name,
                                                  'helperText', blueprint_field.helper_text, 'options', blueprint_field.options)) as fields,
                       json_build_object('email', u.email, 'info', u.additional_info)         as owner
                from blueprint
                         left join blueprint_field on blueprint.id = blueprint_field.blueprint_id
                         left join "user" u on blueprint.user_email = u.email
                where u.email = $1
                  and lower(blueprint.name) like $2
                group by blueprint.id, u.email, blueprint.name
                order by blueprint.name
        `,
		[user.email, `${query.toLowerCase()}%`]
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

export async function listTinyBlueprintsForCustomer({
	customerId,
	dbClient,
}: {
	customerId: string
	dbClient: PoolClient
}): Promise<TinyBlueprint[]> {
	const result = await dbClient.query(
		`
                select blueprint.id,
                       blueprint.name
                from blueprint
                         left join "user" u on blueprint.user_email = u.email
                where u.customer_id = $1
                order by blueprint.name
        `,
		[customerId]
	)
	return result.rows
}

export async function listTinyBlueprintsForUser({
	user,
	dbClient,
}: {
	user: User
	dbClient: PoolClient
}) {
	const result = await dbClient.query(
		`
                select blueprint.id,
                       blueprint.name
                from blueprint
                         left join "user" u on blueprint.user_email = u.email
                where u.email = $1
                order by blueprint.name
        `,
		[user.email]
	)

	return result.rows
}
