import {PoolClient} from 'pg'
import {PaginationPosition} from '../../../constants/models/Pagination'
import {
	BlueprintGroup,
	BlueprintsGroupPreview,
} from '../../../constants/models/BlueprintsGroup'
import {
	UserWithSelectedCustomer,
	UserWithSelectedCustomer as User,
} from '../../../constants/User'

export async function getFields({
	groupId,
	dbClient,
}: {
	groupId: number
	dbClient: PoolClient
}) {
	const result = await dbClient.query(
		`
				select bf.name,
-- 				      todo remove once we use fieldProperties everywhere 
-- 							 json_agg(distinct bf.type) as types,
-- 							 json_agg(bf.display_name)  as "displayName",
-- 							 json_agg(bf.helper_text)   as "helperText",
-- 							 json_agg(bf.options)       as "options",
-- 							 coalesce(
-- 								 json_agg(bf.default_value) filter (where bf.default_value is not null),
-- 								 json_build_array()
-- 								 )                      as "defaultValue",
-- 				       end todo
							 json_agg(json_build_object('id', bf.id, 'name', bf.name, 'type', bf.type, 'displayName', bf.display_name, 'helperText', bf.helper_text,
																					'options', bf.options, 'defaultValue', bf.default_value)) as "fieldsProperties"
				from blueprint_field bf
							 left join blueprint b on bf.blueprint_id = b.id
							 left join blueprint_blueprints_group bbg on b.id = bbg.blueprint_id
							 left join blueprints_group bg on bbg.blueprint_group_id = bg.id
				where bg.id = $1
				group by bf.name
				order by bf.name
		`,
		[groupId]
	)

	return result.rows.map((one) => ({
		...one,
		// displayName: one.displayName[0],
		// helperText: one.helperText[0],
		// options: one.options[0],
	}))
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
              select blueprints_group.id,
                     blueprints_group.name,
                     blueprints_group.created_at                                                      as "createdAt",
                     blueprints_group.project_name                                                    as "projectName",
                     coalesce(
                                     json_agg(
                                     json_build_object('id', b.id, 'googleDocsId', google_docs_id, 'name', b.name,
                                                       'owner',
                                                       json_build_object('email', blueprintOwner.email, 'info',
                                                                         blueprintOwner.additional_info)))
                                     filter (where b.id is not null), json_build_array()
                         )                                                                            as blueprints,
                     json_build_object('email', groupOwner.email, 'info', groupOwner.additional_info) as owner
              from blueprints_group
                       left join blueprint_blueprints_group
                                 on blueprints_group.id = blueprint_blueprints_group.blueprint_group_id
                       left join blueprint b on blueprint_blueprints_group.blueprint_id = b.id
                       left join user_customer blueprintOwnerUc on b.user_customer_id = blueprintOwnerUc.id
                       left join "user" blueprintOwner on blueprintOwnerUc.user_email = blueprintOwner.email
                       left join user_customer groupOwnerUc on blueprints_group.user_customer_id = groupOwnerUc.id
                       left join "user" groupOwner on groupOwnerUc.user_email = groupOwner.email
              where blueprints_group.id = $1::int
                and groupOwnerUc.customer_id = $2
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
	projectName,
	dbClient,
}: {
	name: string
	blueprintsIds: string[]
	user: UserWithSelectedCustomer
	projectName: string
	dbClient: PoolClient
}) {
	try {
		await dbClient.query(`begin`)
		const createdGroupResult = await dbClient.query(
			`
                insert into blueprints_group (name, user_customer_id, project_name)
                values ($1, $2, $3)
                returning id
      `,
			[name, user.selectedCustomer.userCustomerId, projectName]
		)

		const createdGroupId = createdGroupResult.rows[0].id
		await dbClient.query(
			`
				insert into blueprint_blueprints_group (blueprint_id, blueprint_group_id) values ${blueprintsIds
					.map((blueprintId, index) => `($${index + 2}::int, $1::int)`)
					.join(', ')}
			`,
			[createdGroupId, ...blueprintsIds]
		)

		await dbClient.query(`commit`)
		return getGroup({
			groupId: createdGroupId,
			dbClient,
			customerId: user.selectedCustomer.customerId,
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
	user: UserWithSelectedCustomer
	dbClient: PoolClient
}) {
	if (user.selectedCustomer.permissions.canSeeAllBlueprints) {
		const result = await dbClient.query(
			`
                select *
                from blueprint
                left join user_customer uc on blueprint.user_customer_id = uc.id
                where uc.customer_id = $1
                  and blueprint.id = any ($2::int[])
      `,
			[user.selectedCustomer.customerId, blueprintsIds]
		)

		return result.rowCount === blueprintsIds.length
	}

	const result = await dbClient.query(
		`
              select *
              from blueprint
              where blueprint.user_customer_id = $1
                and blueprint.id = any ($2::int[])
    `,
		[user.selectedCustomer.userCustomerId, blueprintsIds]
	)

	return result.rowCount === blueprintsIds.length
}

export async function listBlueprintsGroups({
	user,
	pagination,
	customerWide,
	dbClient,
}: {
	user: UserWithSelectedCustomer
	pagination: PaginationPosition
	customerWide: boolean
	dbClient: PoolClient
}): Promise<BlueprintsGroupPreview[]> {
	const result = await dbClient.query(
		`
              select blueprints_group.id,
                     blueprints_group.name,
                     blueprints_group.created_at                                              as "createdAt",
                     blueprints_group.project_name                                            as "projectName",
                     json_build_object('email', "user".email, 'info', "user".additional_info) as owner
              from blueprints_group
                       left join user_customer uc on blueprints_group.user_customer_id = uc.id
                       left join "user" on uc.user_email = "user".email
              where ${customerWide ? 'uc.customer_id' : 'uc.id'} = $1
              order by blueprints_group.created_at desc
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

export async function searchBlueprintsGroups({
	user,
	query,
	pagination,
	customerWide,
	dbClient,
}: {
	user: UserWithSelectedCustomer
	query: string
	pagination: PaginationPosition
	customerWide: boolean
	dbClient: PoolClient
}) {
	const result = await dbClient.query(
		`
              select blueprints_group.id,
                     blueprints_group.name,
                     blueprints_group.created_at                                              as "createdAt",
                     blueprints_group.project_name                                            as "projectName",
                     json_build_object('email', "user".email, 'info', "user".additional_info) as owner
              from blueprints_group
                       left join user_customer on blueprints_group.user_customer_id = user_customer.id
                       left join "user" on user_customer.user_email = "user".email
              where ${
								customerWide ? 'user_customer.customer_id' : 'user_customer.id'
							} = $1
                and (lower(blueprints_group.name) like $2 or lower(blueprints_group.project_name) like $2)
              order by blueprints_group.created_at desc
              limit $3 offset $4
    `,
		[
			customerWide
				? user.selectedCustomer.customerId
				: user.selectedCustomer.userCustomerId,
			`%${query.toLowerCase()}%`,
			pagination.limit,
			pagination.skip,
		]
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
                where fbf.blueprints_group_submit_id = any ($1::int[])
      `,
			[blueprintsSubmitsIds]
		)

		await dbClient.query(
			`
                delete
                from generated_document fbf
                where fbf.blueprints_group_submit_id = any ($1::int[])
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

export async function modifyBlueprintGroup({
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

		await dbClient.query(
			`
                delete
                from blueprint_blueprints_group
                where blueprint_group_id = $1::int
      `,
			[updatedId]
		)

		if (blueprintsIds.length > 0) {
			await dbClient.query(
				`
				insert into blueprint_blueprints_group (blueprint_id, blueprint_group_id) values ${blueprintsIds
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
              select bgs.id,
                     bgs.submitted_at                                               as "submittedAt",
                     bgs.folder_id                                                  as "folderId",
                     json_build_object('email', u.email, 'info', u.additional_info) as "byUser",
                     json_agg(distinct jsonb_build_object('name', fbf.name, 'type', fbf.type, 'value',
                                                          fbf.value))               as "filledValues",
                     json_agg(distinct
                              jsonb_build_object('id', gd.id, 'name', gd.name, 'googleDocId', gd.google_doc_id,
                                                 'pdfId',
                                                 gd.pdf_id))                        as "generatedFiles"
              from blueprints_group_submit bgs
                       left join filled_blueprint_field fbf on bgs.id = fbf.blueprints_group_submit_id
                       left join generated_document gd on bgs.id = gd.blueprints_group_submit_id
                       left join user_customer uc on bgs.submitted_by_user_customer_id = uc.id
                       left join "user" u on uc.user_email = u.email
              where uc.customer_id = $1
                and bgs.id = $2::int
              group by bgs.id, u.email
    `,
		[customerId, submitId]
	)

	if (submitResult.rowCount === 0) return null
	return submitResult.rows[0]
}

export async function listSubmits({
	blueprintsGroupId,
	user,
	customerWide,
	dbClient,
}: {
	blueprintsGroupId: string
	user: UserWithSelectedCustomer
	customerWide: boolean
	dbClient: PoolClient
}) {
	const submitResult = await dbClient.query(
		`
              select bgs.id,
                     bgs.submitted_at                                               as "submittedAt",
                     bgs.folder_id                                                  as "folderId",
                     json_build_object('email', u.email, 'info', u.additional_info) as "byUser",
                     json_agg(distinct jsonb_build_object('name', fbf.name, 'type', fbf.type, 'value',
                                                          fbf.value))               as "filledValues",
                     json_agg(distinct
                              jsonb_build_object('id', gd.id, 'name', gd.name, 'googleDocId', gd.google_doc_id,
                                                 'pdfId',
                                                 gd.pdf_id))                        as "generatedFiles"
              from blueprints_group_submit bgs
                       left join blueprints_group b on bgs.blueprints_group_id = b.id
                       left join filled_blueprint_field fbf on bgs.id = fbf.blueprints_group_submit_id
                       left join generated_document gd on bgs.id = gd.blueprints_group_submit_id
                       left join user_customer uc on bgs.submitted_by_user_customer_id = uc.id
                       left join "user" u on uc.user_email = u.email
            	where ${customerWide ? 'uc.customer_id' : 'uc.id'} = $1
                and b.id = $2::int 
              group by bgs.id, u.email, bgs.submitted_at
              order by bgs.submitted_at desc
    `,
		[
			customerWide
				? user.selectedCustomer.customerId
				: user.selectedCustomer.userCustomerId,
			blueprintsGroupId,
		]
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
	generated: Array<{
		name: string
		googleDocId: string | null
		pdfId: string | null
	}>
	folderId: string
	values: {[key: string]: {type: string; value: string}}
	user: User
	dbClient: PoolClient
}) {
	const {
		rows: [{id: submitId}],
	} = await dbClient.query(
		`
              insert into blueprints_group_submit (submitted_by_user_customer_id, blueprints_group_id, folder_id)
              values ($1, $2, $3)
              returning id
    `,
		[user.selectedCustomer.userCustomerId, blueprintsGroupId, folderId]
	)

	await dbClient.query(
		`
		insert into filled_blueprint_field (blueprints_group_submit_id, value, name, type) values ${Object.keys(
			values
		)
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
		insert into generated_document (blueprints_group_submit_id, name, google_doc_id, pdf_id) values ${Object.keys(
			generated
		).map(
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

export async function nextIdFieldValue({
	fieldType,
	customerId,
	dbClient,
}: {
	fieldType: string
	customerId: string
	dbClient: PoolClient
}) {
	const result = await dbClient.query(
		`
              select coalesce(value, 0) + 1 as new_value, template, name, id
              from incrementing_field_type
                       left join incrementing_field_value ifv
                                 on incrementing_field_type.id = ifv.incrementing_field_type_id
              where incrementing_field_type.name = $1
                and customer_id = $2
              order by value desc
              limit 1
    `,
		[fieldType, customerId]
	)

	const {new_value: newValue, template, name, id} = result.rows[0]
	return {newValue, template, name, id}
}

/**
 * Creates or returns already created value inserted into template
 */
export async function prepareIncFieldTypeForSubmit({
	blueprintGroupId,
	fieldType,
	customerId,
	dbClient,
}: {
	customerId: string
	fieldType: string
	blueprintGroupId: string
	dbClient: PoolClient
}) {
	// First try to get existing value
	const existingValue = await dbClient.query(
		`
              select ifv.value, ift.template, ift.name
              from incrementing_field_type ift
                       left join incrementing_field_value ifv on ifv.incrementing_field_type_id = ift.id
              where ift.name = $1
                and ift.customer_id = $2
                and ifv.blueprints_group_id = $3
    `,
		[fieldType, customerId, blueprintGroupId]
	)
	if (existingValue.rows.length > 0) {
		const {value, name, template} = existingValue.rows[0]
		return template.replace(`{{${name}}}`, value)
	}

	// If it does not exists create new one create new
	try {
		await dbClient.query('begin')
		const nextValue = await nextIdFieldValue({
			fieldType,
			customerId,
			dbClient,
		})

		await dbClient.query(
			`
                insert into incrementing_field_value (incrementing_field_type_id, value, blueprints_group_id)
                values ($1, $2, $3)
      `,
			[nextValue.id, nextValue.newValue, blueprintGroupId]
		)

		await dbClient.query('commit')
		const {name, newValue: value, template} = nextValue
		return template.replace(`{{${name}}}`, value)
	} catch (e) {
		await dbClient.query('rollback')
		throw e
	}
}

export async function getDataForSpreadsheetExport({
	customerId,
	dbClient,
}: {
	customerId: string
	dbClient: PoolClient
}) {
	const {rows: groupsWithFields} = await dbClient.query(
		`
              select blueprints_group.id,
                     blueprints_group.name,
                     bgs.submitted_at              as "submittedAt",
                     uc.user_email                 as "submittedBy",
                     blueprints_group.project_name as "projectName",
                     coalesce(
                                     json_agg(json_build_object('value', fbf.value, 'name', fbf.name))
                                     filter (where fbf.id is not null), json_build_array()
                         )                         as values,
                     coalesce(
                                     json_agg(bf.name)
                                     filter (where bf.name is not null), json_build_array()
                         )                         as fields
              from blueprints_group
                       left join blueprint_blueprints_group
                                 on blueprints_group.id = blueprint_blueprints_group.blueprint_group_id
                       left join blueprint on blueprint_blueprints_group.blueprint_id = blueprint.id
                       left join user_customer uc on blueprint.user_customer_id = uc.id
                       left join blueprints_group_submit bgs
                                 on blueprints_group.id = bgs.blueprints_group_id
                                     and bgs.submitted_at = (
                                         select MAX(submitted_at)
                                         from blueprints_group_submit
                                         where blueprints_group_submit.blueprints_group_id = blueprints_group.id
                                     )
                       left join blueprint_field bf on blueprint.id = bf.blueprint_id
                       left join filled_blueprint_field fbf
                                 on bgs.id = fbf.blueprints_group_submit_id and fbf.name = bf.name
              where uc.customer_id = $1
                and bgs.submitted_at is not null
              group by blueprints_group.name, blueprints_group.project_name, blueprints_group.id, bgs.submitted_at,
                       uc.user_email
              order by bgs.submitted_at

    `,
		[customerId]
	)

	return groupsWithFields
}
