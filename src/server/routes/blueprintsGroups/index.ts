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
	listBlueprintsGroups,
	deleteBlueprintGroup,
	searchBlueprintsGroups,
	insertSubmit,
	getSubmit,
	listSubmits,
	modifyBlueprintGroup,
	nextIdFieldValue,
	prepareIncFieldTypeForSubmit,
} from './db'
import * as blueprintsGroupsUrls from '../../../constants/api/blueprintsGroups'
import validateBodyMiddleware from '../../utils/validateBodyMiddleware'
import {
	withValidUserWithCustomerMiddleware,
	extractUserWithCustomer,
} from '../../utils/auth'
import {withDataDbMiddleware, extractDbClient} from '../../dbService'
import SendableError from '../../utils/SendableError'
import withPaginationMiddleware, {
	extractPagination,
} from '../../utils/withPaginationMiddleware'
import {
	withUserDriveApiMiddleware,
	extractUserDriveApi,
	withUserGoogleDocsApiMiddleware,
	withServiceAccountDriveApiMiddleware,
	extractDriveApiForServiceAccount,
	extractDocsApiForServiceAccount,
	withServiceAccountDocsApiMiddleware,
} from '../../utils/googleApis'
import {
	canUserRead,
	generateFilledDocument,
	saveDocumentAsPdf,
	replaceTemplatesInFileName,
	sendPriceAlertIfLimitExceeded,
	exportToSpreadsheet,
	createEmptyFolderAndShareItToSA,
} from './utils'
import {
	withCustomerInfoMiddleware,
	extractCustomerInfo,
} from '../../utils/customerInfo'
import {createAndUploadCombinedPdf} from './utils/generateMasterPdf'

const router = new Router()

router.get(
	blueprintsGroupsUrls.getBlueprintGroup,
	withValidUserWithCustomerMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUserWithCustomer(ctx)
		const dbClient = extractDbClient(ctx)
		const {groupId} = ctx.params
		const group: BlueprintGroup | null = await getGroup({
			dbClient,
			groupId,
			customerId: user.selectedCustomer.customerId,
		})
		if (!group) {
			throw new SendableError('Group not found', {
				status: httpStatus.NOT_FOUND,
				errorCode: NOT_FOUND,
			})
		}

		// TODO if user is domain admin

		if (
			group.owner.email !== user.email &&
			!user.selectedCustomer.permissions.canSeeAllBlueprintsGroups
		) {
			throw new SendableError('Insufficient permissions', {
				status: httpStatus.FORBIDDEN,
				errorCode: FORBIDDEN,
			})
		}

		const submits = await listSubmits({
			blueprintsGroupId: groupId,
			user,
			customerWide:
				user.selectedCustomer.permissions.canSeeAllBlueprintsGroupsSubmits,
			dbClient,
		})
		const enhancedSubmits = await Promise.all(
			submits.map(async (submit: any) => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const {folderId, ...rest} = submit
				return {
					...rest,
					folderId,
				}
			})
		)

		ctx.body = {...group, submits: enhancedSubmits}
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
	projectName: {
		type: String,
		required: false,
	},
})

router.post(
	blueprintsGroupsUrls.createGroup,
	withValidUserWithCustomerMiddleware,
	validateBodyMiddleware(createOrEditGroupSchema),
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUserWithCustomer(ctx)
		const dbClient = extractDbClient(ctx)

		// TODO - Allow project name to be null in table
		const {name, projectName = ''} = ctx.request.body
		const blueprintsIds: string[] = unique(ctx.request.body.blueprintsIds)

		if (
			!(await checkIfUserHasAccessToBlueprints({user, blueprintsIds, dbClient}))
		) {
			throw new SendableError('Insufficient permissions', {
				status: httpStatus.FORBIDDEN,
				errorCode: FORBIDDEN,
			})
		}

		try {
			ctx.body = await createGroup({
				blueprintsIds,
				name,
				user,
				projectName,
				dbClient,
			})
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
	withValidUserWithCustomerMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUserWithCustomer(ctx)
		const dbClient = extractDbClient(ctx)
		const {name, blueprintsIds} = ctx.request.body
		const {groupId} = ctx.params
		const group: BlueprintGroup | null = await getGroup({
			dbClient,
			groupId,
			customerId: user.selectedCustomer.customerId,
		})

		if (!group) {
			throw new SendableError('Group not found', {
				status: httpStatus.NOT_FOUND,
				errorCode: NOT_FOUND,
			})
		}

		// TODO if user is domain admin

		if (
			group.owner.email !== user.email &&
			!user.selectedCustomer.permissions.canModifyAllBlueprintsGroups
		) {
			throw new SendableError('Insufficient permissions', {
				status: httpStatus.FORBIDDEN,
				errorCode: FORBIDDEN,
			})
		}

		const submits = await listSubmits({
			blueprintsGroupId: groupId,
			user,
			customerWide:
				user.selectedCustomer.permissions.canSeeAllBlueprintsGroupsSubmits,
			dbClient,
		})

		await modifyBlueprintGroup({
			dbClient,
			blueprintsGroupId: groupId,
			blueprintsIds,
			name,
		})

		ctx.body = {
			...(await getGroup({
				groupId,
				dbClient,
				customerId: user.selectedCustomer.userCustomerId,
			})),
			submits,
		}
		await next()
	}
)

router.get(
	blueprintsGroupsUrls.search,
	withValidUserWithCustomerMiddleware,
	withPaginationMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUserWithCustomer(ctx)
		const dbClient = extractDbClient(ctx)
		const pagination = extractPagination(ctx)
		const {query} = ctx.request.query

		if (!query) {
			throw new SendableError('Missing query', {
				status: httpStatus.BAD_REQUEST,
				errorCode: errorCodes.BAD_BODY,
			})
		}

		ctx.body = await searchBlueprintsGroups({
			user,
			pagination,
			query,
			customerWide: user.selectedCustomer.permissions.canSeeAllBlueprintsGroups,
			dbClient,
		})

		await next()
	}
)

router.get(
	blueprintsGroupsUrls.listBlueprintGroup,
	withValidUserWithCustomerMiddleware,
	withPaginationMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUserWithCustomer(ctx)
		const dbClient = extractDbClient(ctx)
		const pagination = extractPagination(ctx)

		ctx.body = await listBlueprintsGroups({
			user,
			pagination,
			customerWide: user.selectedCustomer.permissions.canSeeAllBlueprintsGroups,
			dbClient,
		})

		await next()
	}
)

router.delete(
	blueprintsGroupsUrls.deleteBlueprintGroup,
	withValidUserWithCustomerMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const user = extractUserWithCustomer(ctx)
		const dbClient = extractDbClient(ctx)
		const {groupId} = ctx.params
		const group: BlueprintGroup | null = await getGroup({
			dbClient,
			groupId,
			customerId: user.selectedCustomer.customerId,
		})

		if (!group) {
			throw new SendableError('Group not found', {
				status: httpStatus.NOT_MODIFIED,
				errorCode: NOT_FOUND,
			})
		}

		if (
			group.owner.email !== user.email &&
			!user.selectedCustomer.permissions.canModifyAllBlueprintsGroups
		) {
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
					return !isString(valueTypeDef.value) || !isString(valueTypeDef.type)
				}),
		},
		message: 'Must be map of type and value objects',
	},
	settings: {
		outputFolder: {
			id: {required: true, type: String},
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
	withValidUserWithCustomerMiddleware,
	validateBodyMiddleware(submitGroupSchema),
	withDataDbMiddleware,
	withUserDriveApiMiddleware,
	withServiceAccountDocsApiMiddleware,
	withUserGoogleDocsApiMiddleware,
	withServiceAccountDriveApiMiddleware,
	withCustomerInfoMiddleware,
	async (ctx, next) => {
		const {
			values,
			settings: {
				generatePdfs,
				generateMasterPdf,
				outputFolder: {id: outputFolderId},
			},
		} = ctx.request.body
		const dbClient = extractDbClient(ctx)
		const user = extractUserWithCustomer(ctx)
		const userDrive = extractUserDriveApi(ctx)
		const serviceAccountDrive = extractDriveApiForServiceAccount(ctx)
		const saDocs = extractDocsApiForServiceAccount(ctx)
		// const userDocs = extractUserGoogleDocsApi(ctx)
		const customerInfo = extractCustomerInfo(ctx)
		const {groupId} = ctx.params

		const blueprintGroup = await getGroup({
			groupId,
			customerId: user.selectedCustomer.customerId,
			dbClient,
		})

		if (!blueprintGroup) {
			throw new SendableError('Group not found', {
				status: httpStatus.NOT_FOUND,
				errorCode: NOT_FOUND,
			})
		}

		// Can user access group?
		if (
			!user.selectedCustomer.permissions.canSeeAllBlueprintsGroups &&
			blueprintGroup.owner.email !== user.email
		) {
			throw new SendableError('Can not access to blueprint group', {
				status: httpStatus.FORBIDDEN,
				errorCode: FORBIDDEN,
			})
		}

		if (!(await canUserRead({drive: userDrive, fileId: outputFolderId}))) {
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
						drive: serviceAccountDrive,
						fileId: blueprint.googleDocsId,
					})

					return {blueprint, hasPermissions}
				})
			)
		).filter((one) => !one.hasPermissions)

		if (blueprintsWithoutPermissions.length > 0) {
			throw new SendableError(
				'Our service account does not have permissions to access one or more blueprints',
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

		const generatedValues: {[key: string]: {value: string; type: string}} = {
			'project_name': {type: 'string', value: blueprintGroup.projectName},
		}

		// TODO start transition
		for (const valueName of Object.keys(values)) {
			const value = values[valueName]
			if (value.type === 'id') {
				generatedValues[valueName] = {
					// eslint-disable-next-line no-await-in-loop
					value: await prepareIncFieldTypeForSubmit({
						blueprintGroupId: groupId,
						fieldType: value.type,
						customerId: user.selectedCustomer.customerId,
						dbClient,
					}),
					type: value.type,
				}
			} else {
				generatedValues[valueName] = value
			}
			// TODO handle if value type does not exist
		}
		// TODO finish transition

		console.info('Submitting filled blueprint', 'Starting', {
			groupId,
			generatedValues,
			outputFolderId,
		})

		const targetFolderId = await createEmptyFolderAndShareItToSA({
			name: blueprintGroup.name,
			userDrive,
			parent: outputFolderId,
		})

		console.info('Submitting filled blueprint', 'Created target folder', {
			targetFolderId,
		})

		console.info('Submitting filled blueprint', {
			totalFilesToGenerate: blueprintGroup.blueprints.length,
		})

		const generateBlueprintTasks = blueprintGroup.blueprints.map(
			async (blueprint) => {
				console.info('Submitting filled blueprint', 'Generating document', {
					blueprint,
				})

				const fileNameRaw = blueprint.name

				const fileName = replaceTemplatesInFileName({
					fileName: fileNameRaw,
					values: generatedValues,
				})

				const googleDocId = await generateFilledDocument({
					blueprint,
					targetFolderId,
					fileName,
					values: Object.keys(generatedValues).reduce<any>(
						(prev, key) => ({...prev, [key]: generatedValues[key].value}),
						{}
					),
					saDrive: serviceAccountDrive,
					saDocs,
				})

				console.info('Submitting filled blueprint', 'Generating PDF')
				let pdfId: string | null = null
				if (generatePdfs) {
					pdfId = await saveDocumentAsPdf({
						name: fileName,
						fileId: googleDocId,
						folderId: targetFolderId,
						drive: serviceAccountDrive,
					})
				}

				console.info('Submitting filled blueprint', 'Document generated', {
					googleDocId,
				})

				return {
					blueprint,
					googleDocId,
					pdfId,
					name: fileName,
				}
			}
		)

		try {
			console.info('Submitting filled blueprint', 'Inserting submits')
			const generated = await Promise.all(generateBlueprintTasks)
			console.info('Submitting filled blueprint', 'Submits inserted')

			console.info('Submitting filled blueprint', {generateMasterPdf})
			if (generateMasterPdf) {
				const docsIds = generated
					.map((one) => one.googleDocId)
					.filter(Boolean) as string[]

				console.info('Submitting filled blueprint', 'Generating master pdf')
				const masterPdfId = await createAndUploadCombinedPdf({
					drive: serviceAccountDrive,
					docsIds,
					folderId: targetFolderId,
					resultName: `${blueprintGroup.name} - master pdf`,
				})
				console.info(
					'Submitting filled blueprint',
					`Master pdf generated ${masterPdfId}`
				)
			}

			const insertedId = await insertSubmit({
				blueprintsGroupId: blueprintGroup.id,
				dbClient,
				folderId: targetFolderId,
				generated,
				values: generatedValues,
				user,
			})

			const submit = await getSubmit({
				submitId: insertedId,
				customerId: user.selectedCustomer.customerId,
				dbClient,
			})

			console.info(
				'Submitting filled blueprint',
				'Sending price limit if exceeded'
			)

			await sendPriceAlertIfLimitExceeded({
				values: Object.keys(generatedValues).reduce(
					(prev, valKey) => ({
						...prev,
						[valKey]: generatedValues[valKey].value,
					}),
					{}
				),
				blueprint: {
					id: submit.id,
					name: submit.name,
					userName: submit.byUser.info?.name || submit.byUser.email,
				},
				customerInfo,
			})

			if (customerInfo.spreadsheetExport) {
				console.info('Submitting filled blueprint', 'Exporting to spreadsheet')
				await exportToSpreadsheet({
					dbClient,
					customerId: user.selectedCustomer.customerId,
					sheetId: customerInfo.spreadsheetExport.spreadsheetId,
				})
			}

			await submit
			ctx.body = submit
		} catch (e) {
			console.log(e.error)
			throw new SendableError(
				'Error while generating documents',
				{
					status: httpStatus.INTERNAL_SERVER_ERROR,
					errorCode: errorCodes.ERROR_GENERATING_DOCUMENT,
				},
				{error: e}
			)
		}

		await next()
	}
)

router.get(
	blueprintsGroupsUrls.getFieldValue,
	withValidUserWithCustomerMiddleware,
	withDataDbMiddleware,
	async (ctx, next) => {
		const dbClient = extractDbClient(ctx)
		const user = extractUserWithCustomer(ctx)

		const {fieldType} = ctx.params

		const nextValue = await nextIdFieldValue({
			fieldType,
			customerId: user.selectedCustomer.customerId,
			dbClient,
		})

		ctx.body = {
			...nextValue,
			compiledValue: nextValue.template.replace(
				`{{${nextValue.name}}}`,
				nextValue.newValue
			),
		}
		await next()
	}
)

router.post(
	blueprintsGroupsUrls.triggerSpreadsheetExport,
	withValidUserWithCustomerMiddleware,
	withDataDbMiddleware,
	withCustomerInfoMiddleware,
	async (ctx, next) => {
		const dbClient = extractDbClient(ctx)
		const user = extractUserWithCustomer(ctx)
		const customerInfo = extractCustomerInfo(ctx)

		if (!customerInfo.spreadsheetExport) {
			ctx.body = 'No config in customer info for exporting spreadsheets'
			ctx.status = 400
			return
		}

		await exportToSpreadsheet({
			dbClient,
			customerId: user.selectedCustomer.customerId,
			// refreshTokenOfWriter: customerInfo.spreadsheetExport.refreshTokenOfWriter,
			sheetId: customerInfo.spreadsheetExport.spreadsheetId,
		})

		ctx.body = {targetSpreadsheet: customerInfo.spreadsheetExport}
		await next()
	}
)

export default router
