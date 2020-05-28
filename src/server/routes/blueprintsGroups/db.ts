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
		from blueprints_group
			left join blueprint_blueprints_group bbg on blueprints_group.id = bbg.blueprint_group_id
			left join blueprint b on bbg.blueprint_id = b.id
			left join blueprint_field bf on b.id = bf.blueprint_id
		where blueprints_group.id = $1
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
            json_agg(json_build_object('id', b.id, 'name', b.name, 'owner', json_build_object('email', blueprintOwner.email, 'info', blueprintOwner.additional_info) )) as blueprints,
            json_build_object('email', groupOwner.email, 'info', groupOwner.additional_info) as owner
        from blueprints_group
            left join blueprint_blueprints_group on blueprints_group.id = blueprint_blueprints_group.blueprint_group_id
            left join blueprint b on blueprint_blueprints_group.blueprint_id = b.id
            left join "user" blueprintOwner on b.user_email = blueprintOwner.email
			left join "user" groupOwner on blueprints_group.created_by = groupOwner.email
			left join domain on groupOwner.domain = domain.domain
			left join customer on domain.customer_id = customer.id
		where blueprints_group.id = $1 and customer.id = $2
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
			where c.id = $1 and blueprint.id in $2::int[]
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
		[user.email, `%${query.toLowerCase()}`]
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
		[customerId, `%${query.toLowerCase()}`]
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
