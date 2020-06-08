import {PoolClient} from 'pg'
import {PaginationPosition} from '../../../constants/models/Pagination'
import {
	BlueprintGroup,
	BlueprintsGroupPreview,
} from '../../../constants/models/BlueprintsGroup'
import User from '../../../constants/User'

export async function getFields({
	groupId,
	dbClient,
}: {
	groupId: number
	dbClient: PoolClient
}) {
	const result = await dbClient.query(
		`
		select
			bf.name,
			json_agg(distinct bf.type) as types
		from blueprint_field bf
			left join blueprint b on bf.blueprint_id = b.id
			left join blueprint_blueprints_group bbg on b.id = bbg.blueprint_id
			left join blueprints_group bg on bbg.blueprint_group_id = bg.id
		where bg.id = $1
		group by bf.name
		order by bf.name asc
	`,
		[groupId]
	)

	return result.rows
}

export async function getGroup({
	groupId,
	dbClient,
	customerId,
}: {
	groupId: number
	dbClient: PoolClient
	customerId: string
}): Promise<BlueprintGroup | null> {
	const result = await dbClient.query(
		`
        select
            blueprints_group.id,
            blueprints_group.name,
            blueprints_group.created_at,
			coalesce(
				json_agg(json_build_object('id', b.id, 'googleDocsId', google_docs_id, 'name', b.name, 'owner', json_build_object('email', blueprintOwner.email, 'info', blueprintOwner.additional_info)))
					filter (where b.id is not null), json_build_array()
			) as blueprints,
			json_build_object('email', groupOwner.email, 'info', groupOwner.additional_info) as owner
        from blueprints_group
            left join blueprint_blueprints_group on blueprints_group.id = blueprint_blueprints_group.blueprint_group_id
            left join blueprint b on blueprint_blueprints_group.blueprint_id = b.id
            left join "user" blueprintOwner on b.user_email = blueprintOwner.email
			left join "user" groupOwner on blueprints_group.created_by = groupOwner.email
			left join domain on groupOwner.domain = domain.domain
			left join customer on domain.customer_id = customer.id
		where blueprints_group.id = $1::int and customer.id = $2
		group by blueprints_group.id, groupOwner.email
	`,
		[groupId, customerId]
	)

	if (result.rows.length === 0) return null
	const groupWithoutFields = result.rows[0]
	const fields = await getFields({groupId, dbClient})
	return {
		...groupWithoutFields,
		fields,
	}
}

export async function createGroup({
	name,
	blueprintsIds,
	user,
	dbClient,
}: {
	name: string
	blueprintsIds: string[]
	user: User
	dbClient: PoolClient
}) {
	try {
		await dbClient.query(`begin`)
		const createdGroupResult = await dbClient.query(
			`
			insert into blueprints_group (name, created_by)
			values ($1, $2)
			returning id
			`,
			[name, user.email]
		)

		const createdGroupId = createdGroupResult.rows[0].id
		await dbClient.query(
			`
				insert into blueprint_blueprints_group (blueprint_id, blueprint_group_id)
				values ${blueprintsIds
					.map((blueprintId, index) => `($${index + 2}::int, $1::int)`)
					.join(', ')}
			`,
			[createdGroupId, ...blueprintsIds]
		)

		await dbClient.query(`commit`)
		return getGroup({
			groupId: createdGroupId,
			dbClient,
			customerId: user.customer.id,
		})
	} catch (e) {
		await dbClient.query(`rollback`)
		throw e
	}
}

export async function checkIfUserHasAccessToBlueprints({
	blueprintsIds,
	user,
	dbClient,
}: {
	blueprintsIds: string[]
	user: User
	dbClient: PoolClient
}) {
	if (user.customerAdmin) {
		const result = await dbClient.query(
			`
			select * from blueprint
			left join "user" u on blueprint.user_email = u.email
			left join domain d on u.domain = d.domain
			left join customer c on d.customer_id = c.id
			where c.id = $1 and blueprint.id = any($2::int[])
		`,
			[user.customer.id, blueprintsIds]
		)

		return result.rowCount === blueprintsIds.length
	}
	const result = await dbClient.query(
		`
		select * from blueprint
		where blueprint.user_email = $1 and blueprint.id = any($2::int[])
	`,
		[user.email, blueprintsIds]
	)

	return result.rowCount === blueprintsIds.length
}

export async function listBlueprintsGroupsForUser({
	user,
	pagination,
	dbClient,
}: {
	user: User
	pagination: PaginationPosition
	dbClient: PoolClient
}): Promise<BlueprintsGroupPreview[]> {
	const result = await dbClient.query(
		`
		select 
			blueprints_group.id, 
			blueprints_group.name,
			blueprints_group.created_at as "createdAt",
			json_build_object('email', "user".email, 'info', "user".additional_info) as owner
		from blueprints_group
			left join "user" on blueprints_group.created_by = "user".email
		where "user".email = $1
		order by blueprints_group.created_at desc
		limit $2 offset $3
	`,
		[user.email, pagination.limit, pagination.skip]
	)

	return result.rows
}

export async function listBlueprintsGroupsForCustomer({
	customerId,
	pagination,
	dbClient,
}: {
	customerId: string
	pagination: PaginationPosition
	dbClient: PoolClient
}): Promise<BlueprintsGroupPreview[]> {
	const result = await dbClient.query(
		`
		select 
			blueprints_group.id, 
			blueprints_group.name,
			blueprints_group.created_at as "createdAt",
			json_build_object('email', "user".email, 'info', "user".additional_info) as owner
		from blueprints_group
			left join "user" on blueprints_group.created_by = "user".email
			left join domain d on "user".domain = d.domain
			left join customer c on d.customer_id = c.id
		where c.id= $1
		order by blueprints_group.created_at desc
		limit $2 offset $3
	`,
		[customerId, pagination.limit, pagination.skip]
	)

	return result.rows
}

export async function searchUsersBlueprintsGroups({
	user,
	query,
	dbClient,
}: {
	user: User
	query: string
	dbClient: PoolClient
}) {
	const result = await dbClient.query(
		`
	select 
			blueprints_group.id, 
			blueprints_group.name,
			blueprints_group.created_at as "createdAt",
			json_build_object('email', "user".email, 'info', "user".additional_info) as owner
		from blueprints_group
			left join "user" on blueprints_group.created_by = "user".email
		where "user".email = $1 and lower(blueprints_group.name) like $2 
		order by blueprints_group.name asc
	`,
		[user.email, `${query.toLowerCase()}%`]
	)

	return result.rows
}

export async function searchCustomersBlueprintsGroups({
	query,
	customerId,
	dbClient,
}: {
	query: string
	customerId: string
	dbClient: PoolClient
}) {
	const result = await dbClient.query(
		`
		select 
			blueprints_group.id, 
			blueprints_group.name,
			blueprints_group.created_at as "createdAt",
			json_build_object('email', "user".email, 'info', "user".additional_info) as owner
		from blueprints_group
			left join "user" on blueprints_group.created_by = "user".email
			left join domain d on "user".domain = d.domain
			left join customer c on d.customer_id = c.id
		where c.id= $1 and lower(blueprints_group.name) like $2
		order by blueprints_group.name asc
	`,
		[customerId, `${query.toLowerCase()}%`]
	)

	return result.rows
}

export async function deleteBlueprintGroup({
	dbClient,
	blueprintGroupId,
}: {
	dbClient: PoolClient
	blueprintGroupId: string
}) {
	try {
		await dbClient.query('begin')

		const blueprintsSubmitsIds = (
			await dbClient.query(
				`
			select id 
			from blueprints_group_submit bgs
			where bgs.blueprints_group_id = $1
		`,
				[blueprintGroupId]
			)
		).rows.map((one) => one.id)

		await dbClient.query(
			`
			delete 
			from filled_blueprint_field fbf
			where fbf.blueprints_group_submit_id = any($1::int[])
		`,
			[blueprintsSubmitsIds]
		)

		await dbClient.query(
			`
			delete 
			from generated_document fbf
			where fbf.blueprints_group_submit_id = any($1::int[])
		`,
			[blueprintsSubmitsIds]
		)

		await dbClient.query(
			`
			delete
			from blueprints_group_submit bgs
			where bgs.blueprints_group_id = $1
		`,
			[blueprintGroupId]
		)

		await dbClient.query(
			`
		delete
		from blueprint_blueprints_group
		where blueprint_group_id = $1
	`,
			[blueprintGroupId]
		)

		await dbClient.query(
			`
		delete 
		from blueprints_group
		where blueprints_group.id = $1
	`,
			[blueprintGroupId]
		)
		await dbClient.query('commit')
	} catch (e) {
		await dbClient.query('rollback')
		throw e
	}
}

export async function modifyBlueprint({
	dbClient,
	blueprintsGroupId,
	name,
	blueprintsIds,
}: {
	dbClient: PoolClient
	name: string
	blueprintsGroupId: string
	blueprintsIds: string[]
}) {
	try {
		await dbClient.query(`begin`)
		const {
			rows: [{id: updatedId}],
		} = await dbClient.query(
			`
			update blueprints_group
				set name = $1
			where blueprints_group.id = $2
			returning blueprints_group.id
		`,
			[name, blueprintsGroupId]
		)

		console.log(blueprintsGroupId, updatedId)

		await dbClient.query(
			`
			delete
			from blueprint_blueprints_group
			where blueprint_group_id = $1::int
		`,
			[updatedId]
		)

		console.log(
			updatedId,
			blueprintsIds,
			`insert into blueprint_blueprints_group (blueprint_id, blueprint_group_id)
		values ${blueprintsIds
			.map((blueprintId, index) => `($${index + 2}::int, $1::int)`)
			.join(', ')}`
		)

		if (blueprintsIds.length > 0) {
			await dbClient.query(
				`
				insert into blueprint_blueprints_group (blueprint_id, blueprint_group_id)
				values ${blueprintsIds
					.map((blueprintId, index) => `($${index + 2}::int, $1::int)`)
					.join(', ')}
			`,
				[updatedId, ...blueprintsIds]
			)
		}

		await dbClient.query(`commit`)
	} catch (e) {
		await dbClient.query(`rollback`)
		throw e
	}
}

export async function getCredentialsForBlueprint({
	blueprintId,
	dbClient,
}: {
	blueprintId: string
	dbClient: PoolClient
}): Promise<{
	accessToken?: string
	refreshToken?: string
} | null> {
	const result = await dbClient.query(
		`
		select 
			u.google_access_token as "accessToken",
			u.google_refresh_token as "refreshToken"
		from blueprint
			left join "user" u on u.email = blueprint.user_email
		where blueprint.id = $1
	`,
		[blueprintId]
	)

	if (result.rows.length === 0) return null
	return result.rows[0]
}

export async function getSubmit({
	submitId,
	customerId,
	dbClient,
}: {
	submitId: string
	customerId: string
	dbClient: PoolClient
}) {
	const submitResult = await dbClient.query(
		`
		select
			bgs.id,
			bgs.submitted_at as "submittedAt",
			bgs.folder_id as "folderId",
			json_build_object('email', u.email, 'info', u.additional_info) as "byUser",
			json_agg(distinct jsonb_build_object('name', fbf.name, 'type', fbf.type, 'value', fbf.value)) as "filledValues",
			json_agg(distinct jsonb_build_object('id', gd.id, 'name', gd.name, 'googleDocId', gd.google_doc_id, 'pdfId', gd.pdf_id)) as "generatedFiles"
		from blueprints_group_submit bgs
			left join filled_blueprint_field fbf on bgs.id = fbf.blueprints_group_submit_id
			left join generated_document gd on bgs.id = gd.blueprints_group_submit_id
			left join "user" u on bgs.submitted_by_email = u.email
			left join domain d on u.domain = d.domain
		where d.customer_id = $1 and bgs.id = $2::int
		group by bgs.id, u.email
	`,
		[customerId, submitId]
	)

	if (submitResult.rowCount === 0) return null
	return submitResult.rows[0]
}

export async function listSubmitsForUser({
	blueprintsGroupId,
	customerId,
	user,
	dbClient,
}: {
	blueprintsGroupId: string
	customerId: string
	user: User
	dbClient: PoolClient
}) {
	const submitResult = await dbClient.query(
		`
		select
			bgs.id,
			bgs.submitted_at as "submittedAt",
			bgs.folder_id as "folderId",
			json_build_object('email', u.email, 'info', u.additional_info) as "byUser",
			json_agg(distinct jsonb_build_object('name', fbf.name, 'type', fbf.type, 'value', fbf.value)) as "filledValues",
			json_agg(distinct jsonb_build_object('id', gd.id, 'name', gd.name, 'googleDocId', gd.google_doc_id, 'pdfId', gd.pdf_id)) as "generatedFiles"
		from blueprints_group_submit bgs
			left join blueprints_group b on bgs.blueprints_group_id = b.id
			left join filled_blueprint_field fbf on bgs.id = fbf.blueprints_group_submit_id
			left join generated_document gd on bgs.id = gd.blueprints_group_submit_id
			left join "user" u on bgs.submitted_by_email = u.email
			left join domain d on u.domain = d.domain
		where d.customer_id = $1 and b.id = $2::int and u.email = $3
		group by bgs.id, u.email
		order by bgs.submitted_at desc
	`,
		[customerId, blueprintsGroupId, user.email]
	)

	return submitResult.rows
}

export async function listSubmitsForCustomer({
	blueprintsGroupId,
	customerId,
	dbClient,
}: {
	blueprintsGroupId: string
	customerId: string
	dbClient: PoolClient
}) {
	const submitResult = await dbClient.query(
		`
		select
			bgs.id,
			bgs.submitted_at as "submittedAt",
			bgs.folder_id as "folderId",
			json_build_object('email', u.email, 'info', u.additional_info) as "byUser",
			json_agg(distinct jsonb_build_object('name', fbf.name, 'type', fbf.type, 'value', fbf.value)) as "filledValues",
			json_agg(distinct jsonb_build_object('id', gd.id, 'name', gd.name, 'googleDocId', gd.google_doc_id, 'pdfId', gd.pdf_id)) as "generatedFiles"
		from blueprints_group_submit bgs
			left join blueprints_group b on bgs.blueprints_group_id = b.id
			left join filled_blueprint_field fbf on bgs.id = fbf.blueprints_group_submit_id
			left join generated_document gd on bgs.id = gd.blueprints_group_submit_id
			left join "user" u on bgs.submitted_by_email = u.email
			left join domain d on u.domain = d.domain
		where d.customer_id = $1 and b.id = $2::int
		group by bgs.id, u.email
		order by bgs.submitted_at desc
	`,
		[customerId, blueprintsGroupId]
	)

	return submitResult.rows
}

export async function insertSubmit({
	blueprintsGroupId,
	generated,
	folderId,
	values,
	user,
	dbClient,
}: {
	blueprintsGroupId: string
	generated: Array<{name: string; googleDocId: string; pdfId: string | null}>
	folderId: string
	values: {[key: string]: {type: string; value: string}}
	user: User
	dbClient: PoolClient
}) {
	const {
		rows: [{id: submitId}],
	} = await dbClient.query(
		`
		insert into blueprints_group_submit (submitted_by_email, blueprints_group_id, folder_id)
		values ($1, $2, $3)
		returning id
	`,
		[user.email, blueprintsGroupId, folderId]
	)

	await dbClient.query(
		`
		insert into filled_blueprint_field (blueprints_group_submit_id, value, name, type)
		values ${Object.keys(values)
			.map(
				(_, index) =>
					`($1, $${index * 3 + 2}, $${index * 3 + 3}, $${index * 3 + 4})`
			)
			.join(', ')}
	`,
		[
			submitId,
			...Object.keys(values).reduce<any[]>((prev, key) => {
				const value = values[key]
				return [...prev, value.value, key, value.type]
			}, []),
		]
	)

	await dbClient.query(
		`
		insert into generated_document (blueprints_group_submit_id, name, google_doc_id, pdf_id)
		values ${Object.keys(generated).map(
			(_, index) =>
				`($1, $${index * 3 + 2}, $${index * 3 + 3}, $${index * 3 + 4})`
		)}
	`,
		[
			submitId,
			...generated.reduce<any[]>(
				(prev, {name, googleDocId, pdfId}) => [
					...prev,
					name,
					googleDocId,
					pdfId,
				],
				[]
			),
		]
	)
	return submitId
}