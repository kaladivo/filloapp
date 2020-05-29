import unique from 'array-unique'
import httpStatus from 'http-status-codes'
import Schema from 'validate'
import Router from 'koa-router'
// @ts-ignore
import isString from 'is-string'
import isObject from 'is-object'
import errorCodes, {
	NOT_FOUND,
	FORBIDDEN,
	UNKNOWN,
} from '../../../constants/errorCodes'

import {BlueprintGroup} from '../../../constants/models/BlueprintsGroup'

import {
	createGroup,
	getGroup,
	checkIfUserHasAccessToBlueprints,
	listBlueprintsGroupsForUser,
	listBlueprintsGroupsForCustomer,
	searchUsersBlueprintsGroups,
	deleteBlueprintGroup,
	searchCustomersBlueprintsGroups,
	insertSubmit,
	getSubmit,
	listSubmitsForCustomer,
	listSubmitsForUser,
	modifyBlueprint,
} from './db'
import * as blueprintsGroupsUrls from '../../../constants/api/blueprintsGroups'
import validateBodyMiddleware from '../../utils/validateBodyMiddleware'
import {withValidUserMiddleware, extractUser} from '../../utils/auth'
import {withDataDbMiddleware, extractDbClient} from '../../dbService'
import SendableError from '../../utils/SendableError'
import withPaginationMiddleware, {
	extractPagination,
} from '../../utils/withPaginationMiddleware'
import {
	withDriveApiMiddleware,
	extractDriveApi,
	withGoogleDocsApiMiddleware,
	extractGoogleDocsApi,
} from '../../utils/googleApis'
import {canUserRead, generateFilledDocument, saveDocumentAsPdf} from './utils'

const router = new Router()

router.get(
	blueprintsGroupsUrls.getBlueprintGroup,
	withValidUserMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUser(ctx)
		const dbClient = extractDbClient(ctx)
		const {groupId} = ctx.params
		const group: BlueprintGroup | null = await getGroup({
			dbClient,
			groupId,
			customerId: user.customer.id,
		})
		if (!group) {
			throw new SendableError('Group not found', {
				status: httpStatus.NOT_FOUND,
				errorCode: NOT_FOUND,
			})
		}

		// TODO if user is domain admin

		if (group.owner.email !== user.email && !user.customerAdmin) {
			throw new SendableError('Insufficient permissions', {
				status: httpStatus.FORBIDDEN,
				errorCode: FORBIDDEN,
			})
		}

		let submits = []
		if (user.customerAdmin) {
			submits = await listSubmitsForCustomer({
				blueprintsGroupId: groupId,
				customerId: user.customer.id,
				dbClient,
			})
		} else {
			submits = await listSubmitsForUser({
				blueprintsGroupId: groupId,
				customerId: user.customer.id,
				dbClient,
				user,
			})
		}

		ctx.body = {...group, submits}
		await next()
	}
)

const createOrEditGroupSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	blueprintsIds: {
		type: Array,
		each: {type: String},
		required: true,
	},
})

router.post(
	blueprintsGroupsUrls.createGroup,
	withValidUserMiddleware,
	validateBodyMiddleware(createOrEditGroupSchema),
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUser(ctx)
		const dbClient = extractDbClient(ctx)

		const {name} = ctx.request.body
		const blueprintsIds: string[] = unique(ctx.request.body.blueprintsIds)

		console.log('here')

		if (
			!(await checkIfUserHasAccessToBlueprints({user, blueprintsIds, dbClient}))
		) {
			throw new SendableError('Insufficient permissions', {
				status: httpStatus.FORBIDDEN,
				errorCode: FORBIDDEN,
			})
		}

		console.log('here')

		try {
			ctx.body = await createGroup({blueprintsIds, name, user, dbClient})
			if (!ctx.body) {
				throw new Error('Not created for some reason. Should not happen')
			}
			await next()
		} catch (e) {
			throw new SendableError(
				'Unable to create blueprint',
				{
					status: httpStatus.INTERNAL_SERVER_ERROR,
					errorCode: UNKNOWN,
				},
				{error: e}
			)
		}
	}
)

router.put(
	blueprintsGroupsUrls.editBlueprint,
	validateBodyMiddleware(createOrEditGroupSchema),
	withValidUserMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUser(ctx)
		const dbClient = extractDbClient(ctx)
		const {name, blueprintsIds} = ctx.request.body
		const {groupId} = ctx.params
		const group: BlueprintGroup | null = await getGroup({
			dbClient,
			groupId,
			customerId: user.customer.id,
		})

		if (!group) {
			throw new SendableError('Group not found', {
				status: httpStatus.NOT_FOUND,
				errorCode: NOT_FOUND,
			})
		}

		// TODO if user is domain admin

		if (group.owner.email !== user.email && !user.customerAdmin) {
			throw new SendableError('Insufficient permissions', {
				status: httpStatus.FORBIDDEN,
				errorCode: FORBIDDEN,
			})
		}

		console.log('here')

		let submits = []
		if (user.customerAdmin) {
			submits = await listSubmitsForCustomer({
				blueprintsGroupId: groupId,
				customerId: user.customer.id,
				dbClient,
			})
		} else {
			submits = await listSubmitsForUser({
				blueprintsGroupId: groupId,
				customerId: user.customer.id,
				dbClient,
				user,
			})
		}

		await modifyBlueprint({
			dbClient,
			blueprintsGroupId: groupId,
			blueprintsIds,
			name,
		})

		ctx.body = {
			...(await getGroup({groupId, dbClient, customerId: user.customer.id})),
			submits,
		}
		await next()
	}
)

router.get(
	blueprintsGroupsUrls.search,
	withValidUserMiddleware,
	withPaginationMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUser(ctx)
		const dbClient = extractDbClient(ctx)
		const {query} = ctx.request.query

		if (!query) {
			throw new SendableError('Missing query', {
				status: httpStatus.BAD_REQUEST,
				errorCode: errorCodes.BAD_BODY,
			})
		}

		if (user.customerAdmin) {
			ctx.body = await searchCustomersBlueprintsGroups({
				customerId: user.customer.id,
				query,
				dbClient,
			})
		} else {
			ctx.body = await searchUsersBlueprintsGroups({user, query, dbClient})
		}

		await next()
	}
)

router.get(
	blueprintsGroupsUrls.listBlueprintGroup,
	withValidUserMiddleware,
	withPaginationMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUser(ctx)
		const dbClient = extractDbClient(ctx)
		const pagination = extractPagination(ctx)

		if (user.customerAdmin) {
			ctx.body = await listBlueprintsGroupsForCustomer({
				customerId: user.customer.id,
				pagination,
				dbClient,
			})
		} else {
			ctx.body = await listBlueprintsGroupsForUser({user, pagination, dbClient})
		}

		await next()
	}
)

router.delete(
	blueprintsGroupsUrls.deleteBlueprintGroup,
	withValidUserMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUser(ctx)
		const dbClient = extractDbClient(ctx)
		const {groupId} = ctx.params
		const group: BlueprintGroup | null = await getGroup({
			dbClient,
			groupId,
			customerId: user.customer.id,
		})

		if (!group) {
			throw new SendableError('Group not found', {
				status: httpStatus.NOT_MODIFIED,
				errorCode: NOT_FOUND,
			})
		}

		if (group.owner.email !== user.email && !user.customerAdmin) {
			throw new SendableError('Insufficient permissions', {
				status: httpStatus.FORBIDDEN,
				errorCode: FORBIDDEN,
			})
		}

		await deleteBlueprintGroup({dbClient, blueprintGroupId: group.id})
		ctx.body = group.id

		await next()
	}
)

const submitGroupSchema = new Schema({
	values: {
		required: true,
		use: {
			isMap: (val) =>
				isObject(val) &&
				!Object.keys(val).some((key) => {
					const valueTypeDef = val[key]
					return (
						!isString(valueTypeDef.value) ||
						!['string'].includes(valueTypeDef.type)
					)
				}),
		},
		message: 'Must be map of type and value objects',
	},
	settings: {
		outputName: {
			required: true,
			type: String,
		},
		outputFolderId: {
			required: true,
			type: String,
		},
		generatePdfs: {
			required: true,
			type: Boolean,
		},
		generateMasterPdf: {
			required: true,
			type: Boolean,
		},
	},
})

router.post(
	blueprintsGroupsUrls.submit,
	withValidUserMiddleware,
	validateBodyMiddleware(submitGroupSchema),
	withDataDbMiddleware,
	withDriveApiMiddleware,
	withGoogleDocsApiMiddleware,
	async (ctx, next) => {
		const {
			values,
			settings: {outputName, generatePdfs, outputFolderId},
		} = ctx.request.body
		const dbClient = extractDbClient(ctx)
		const user = extractUser(ctx)
		const drive = extractDriveApi(ctx)
		const docs = extractGoogleDocsApi(ctx)
		const {groupId} = ctx.params

		const blueprintGroup = await getGroup({
			groupId,
			customerId: user.customer.id,
			dbClient,
		})
		if (!blueprintGroup) {
			throw new SendableError('Group not found', {
				status: httpStatus.NOT_FOUND,
				errorCode: NOT_FOUND,
			})
		}
		// Can user access group?
		if (!user.customerAdmin && blueprintGroup.owner.email !== user.email) {
			throw new SendableError('Can not access to blueprint group', {
				status: httpStatus.FORBIDDEN,
				errorCode: FORBIDDEN,
			})
		}

		// // Can user access individual blueprints?
		// if (
		// 	!user.customerAdmin &&
		// 	blueprintGroup.blueprints.some(
		// 		(oneBlueprint) => oneBlueprint.owner.email !== user.email
		// 	)
		// ) {
		// 	throw new SendableError(
		// 		'Can not access to some blueprint form blueprint group',
		// 		{
		// 			status: httpStatus.FORBIDDEN,
		// 			errorCode: FORBIDDEN,
		// 		}
		// 	)
		// }

		if (!(await canUserRead({drive, fileId: outputFolderId}))) {
			throw new SendableError(
				'Output folder can not be accessed current user.',
				{
					errorCode: errorCodes.UNABLE_TO_ACCESS_OUTPUT_FOLDER,
					status: httpStatus.BAD_REQUEST,
				}
			)
		}

		const blueprintsWithoutPermissions = (
			await Promise.all(
				blueprintGroup.blueprints.map(async (blueprint) => {
					const hasPermissions = await canUserRead({
						drive,
						fileId: blueprint.googleDocsId,
					})

					return {blueprint, hasPermissions}
				})
			)
		).filter((one) => !one.hasPermissions)

		if (blueprintsWithoutPermissions.length > 0) {
			throw new SendableError(
				'You dont have permissions to access one or more blueprints',
				{
					errorCode: errorCodes.UNABLE_TO_ACCESS_DRIVE_FILE,
					status: 400,
					payload: {
						filesWithoutPermissions: blueprintsWithoutPermissions.map(
							(one) => ({
								blueprintId: one.blueprint.id,
								fileId: one.blueprint.googleDocsId,
								url: `https://docs.google.com/document/d/${one.blueprint.googleDocsId}/edit?usp=sharing`,
							})
						),
					},
				}
			)
		}

		const generateBlueprintTasks = blueprintGroup.blueprints.map(
			async (blueprint) => {
				const fileName = `${outputName} - ${blueprint.name}`
				const googleDocId = await generateFilledDocument({
					blueprint,
					targetFolderId: outputFolderId,
					fileName,
					values: Object.keys(values).reduce<any>(
						(prev, key) => ({...prev, [key]: values[key].value}),
						{}
					),
					docs,
					drive,
				})

				let pdfId: string | null = null
				if (generatePdfs) {
					pdfId = await saveDocumentAsPdf({
						name: fileName,
						fileId: googleDocId,
						folderId: outputFolderId,
						drive,
					})
				}

				return {blueprint, googleDocId, pdfId, name: fileName}
			}
		)

		try {
			const generated = await Promise.all(generateBlueprintTasks)
			const insertedId = await insertSubmit({
				blueprintsGroupId: blueprintGroup.id,
				dbClient,
				folderId: outputFolderId,
				generated,
				values,
				user,
			})
			ctx.body = await getSubmit({
				submitId: insertedId,
				customerId: user.customer.id,
				dbClient,
			})
		} catch (e) {
			throw new SendableError(
				'Error while generating documents',
				{
					status: httpStatus.INTERNAL_SERVER_ERROR,
					errorCode: errorCodes.ERROR_GENERATING_DOCUMENTS,
				},
				{error: e}
			)
		}

		// Generate documents
		// - Check if document can be accessed
		// - Check if folder can be accessed
		// Generate PDF files
		// Generate master pdf file
		// Save submit to db

		await next()
	}
)

export default router
