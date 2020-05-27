import {PoolClient} from 'pg'
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
        select id, google_docs_id as googleDocsId, name
        from blueprint
		where google_docs_id = $1 and user_email = $2
    `,
		[fileId, user.email]
	)
	if (result.rows.length === 0) return null
	const blueprint = result.rows[0]

	// TODO move into one query
	const {rows: fields} = await dbClient.query(
		`
		select id, name, type
		from blueprint_field
		where blueprint_id = $1::int
	`,
		[blueprint.id]
	)

	return {
		...blueprint,
		fields,
	}
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
