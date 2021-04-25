import Router from 'koa-router'
import httpStatus from 'http-status-codes'
import Schema from 'validate'
import isObject from 'is-object'
// @ts-ignore
import isString from 'is-string'
import * as blueprintsGroupsUrls from '../../../../constants/api/blueprintsGroups'
import {
	extractUserWithCustomer,
	withValidUserWithCustomerMiddleware,
} from '../../../utils/auth'
import validateBodyMiddleware from '../../../utils/validateBodyMiddleware'
import {extractDbClient, withDataDbMiddleware} from '../../../dbService'
import {
	extractDocsApiForServiceAccount,
	extractDriveApiForServiceAccount,
	extractUserDriveApi,
	withServiceAccountDocsApiMiddleware,
	withServiceAccountDriveApiMiddleware,
	withUserDriveApiMiddleware,
	withUserGoogleDocsApiMiddleware,
} from '../../../utils/googleApis'
import {
	extractCustomerInfo,
	withCustomerInfoMiddleware,
} from '../../../utils/customerInfo'
import {
	getGroup,
	getSubmit,
	insertSubmit,
	prepareIncFieldTypeForSubmit,
} from '../db'
import SendableError from '../../../utils/SendableError'
import errorCodes, {
	FORBIDDEN,
	NOT_FOUND,
} from '../../../../constants/errorCodes'
import {
	canUserRead,
	createEmptyFolderAndShareItToSA,
	exportToSpreadsheet,
	generateFilledDocument,
	replaceTemplatesInFileName,
	saveDocumentAsPdf,
	sendPriceAlertIfLimitExceeded,
} from '../utils'
import {createAndUploadCombinedPdf} from '../utils/generateMasterPdf'

const router = new Router()

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
					generatedValues,
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

				console.info('Submitting filled blueprint', 'Document generated', {
					fileName,
					googleDocId,
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

export default router
