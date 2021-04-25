import {PoolClient} from 'pg'
import {drive_v3 as driveV3, docs_v1 as docsV1, google} from 'googleapis'
import {Stream} from 'stream'
import unique from 'array-unique'
import {CustomerInfo} from '../../../../constants/models/customerInfo'
import {Blueprint} from '../../../../constants/models/Blueprint'
import sendMail from '../../../utils/sendMail'
import {getOauth2ClientForServiceAccount} from '../../../utils/googleApis'
import {getDataForSpreadsheetExport} from '../db'

// const TEMP_FOLDER: string = String(process.env.TEMP_FOLDER)
const SERVICE_ACCOUNT_EMAIL = String(process.env.SERVICE_ACCOUNT_EMAIL)

export interface Tokens {
	accessToken?: string
	refreshToken?: string
}

export async function hasWriteAccess({
	fileId,
	drive,
}: {
	fileId: string
	drive: driveV3.Drive
}) {
	try {
		// This can be acquired only if drive has write access
		await drive.permissions.list({fileId})
		return true
	} catch (e) {
		return false
	}
}

export async function canBeRed({
	fileId,
	drive,
}: {
	fileId: string
	drive: driveV3.Drive
}): Promise<boolean> {
	try {
		await drive.files.get({fileId})
		return true
	} catch (e) {
		return false
	}
}

async function replaceTemplateStrings({
	documentId,
	keyMap,
	docs,
}: {
	documentId: string
	keyMap: any
	docs: docsV1.Docs
}) {
	const replaceTextRequests = Object.keys(keyMap).map((key) => {
		return {
			replaceAllText: {
				containsText: {text: `{{${key}}}`, matchCase: true},
				replaceText: keyMap[key],
			},
		}
	})

	await docs.documents.batchUpdate({
		documentId,
		requestBody: {
			requests: replaceTextRequests,
		},
	})
}

export async function createEmptyFolderAndShareItToSA({
	name,
	userDrive,
	parent,
}: {
	name: string
	userDrive: driveV3.Drive
	parent: string
}): Promise<string> {
	const newFolderResponse = await userDrive.files.create({
		requestBody: {
			name,
			mimeType: 'application/vnd.google-apps.folder',
			parents: [parent],
		},
	})
	const folderId = newFolderResponse.data.id

	// @ts-ignore This is tested  and works
	await userDrive.permissions.create({
		fileId: folderId,
		sendNotificationEmail: false,
		requestBody: {
			role: 'writer',
			type: 'user',
			emailAddress: SERVICE_ACCOUNT_EMAIL,
		},
	})

	return folderId || '' // todo Should not happen catch and report
}

export async function shareFolderToSA({
	folderId,
	drive,
}: {
	folderId: string
	drive: driveV3.Drive
}) {
	// @ts-ignore This is tested  and works
	await drive.permissions.create({
		fileId: folderId,
		sendNotificationEmail: false,
		requestBody: {
			role: 'writer',
			type: 'user',
			emailAddress: SERVICE_ACCOUNT_EMAIL,
		},
	})
}

export async function generateFilledDocument({
	blueprint,
	targetFolderId,
	fileName,
	values,
	saDrive,
	saDocs,
}: {
	blueprint: Blueprint
	fileName: string
	values: any
	targetFolderId: string
	saDrive: driveV3.Drive
	saDocs: docsV1.Docs
}): Promise<string> {
	// This process is quite tough and obstruct. But it is the only way that I was
	// able to successfully test and it works. The result is folder with all of the documents

	// Copy the blueprint
	const copyResponse = await saDrive.files.copy({
		fileId: blueprint.googleDocsId,
		requestBody: {parents: [targetFolderId], name: fileName},
	})
	const copyId = copyResponse.data.id || '' // TODO catch and report

	await replaceTemplateStrings({
		documentId: copyId,
		keyMap: values,
		docs: saDocs,
	})

	// @ts-ignore - tested and it works
	const getLinkResponse = await saDrive.files.get({
		fileId: copyId,
	})

	return getLinkResponse.data.id || '' // TODO catch and report
}

export async function saveDocumentAsPdf({
	name,
	fileId,
	folderId,
	drive,
}: {
	name: string
	fileId: string
	folderId: string
	drive: driveV3.Drive
}): Promise<string> {
	const exportResponse = await drive.files.export(
		{
			fileId,
			mimeType: 'application/pdf',
		},
		{
			responseType: 'stream',
		}
	)
	// @ts-ignore
	const outputStream: Stream = exportResponse.data

	const creatResponse = await drive.files.create({
		media: {
			mimeType: 'application/pdf',
			body: outputStream,
		},
		requestBody: {
			name,
			mimeType: 'application/pdf',
			parents: [folderId],
		},
	})

	return creatResponse.data.id || '0'
}

export async function getFolderInfo({
	folderId,
	drive,
}: {
	folderId: string
	drive: driveV3.Drive
}) {
	try {
		const exportResponse = await drive.files.get({
			fileId: folderId,
		})
		const {id, name} = exportResponse.data
		return {id, name}
	} catch (e) {
		return null
	}
}

export async function silentlyDeleteFile({
	fileId,
	drive,
}: {
	fileId: string
	drive: driveV3.Drive
}) {
	console.log('removing file', {fileId})
	try {
		await drive.files.delete({
			fileId,
		})
	} catch (e) {
		// Fail silently
	}
}

// export async function shareWithUser({
// 	fileId,
// 	userEmail,
// 	drive,
// }: {
// 	fileId: string
// 	userEmail: string
// 	drive: driveV3.Drive
// }) {
// 	const result = await drive.permissions.create({
// 		fileId,
// 		sendNotificationEmail: false,
// 		requestBody: {role: 'reader', type: 'user', emailAddress: userEmail},
// 	})

// 	console.log(result.data)
// }

// export async function generateMasterPdf({
// 	documentsIds,
// 	fileName,
// 	targetFolderId,
// }: {
// 	documentsIds: string[]
// 	fileName: string
// 	targetFolderId: string
// }) {}

export function replaceTemplatesInFileName({
	fileName,
	values,
}: {
	fileName: string
	values: {[key: string]: {value: string}}
}) {
	let newFileName = fileName

	for (const valueName of Object.keys(values)) {
		newFileName = newFileName.replace(
			`{{${valueName}}}`,
			values[valueName].value
		)
	}

	return newFileName
}

export async function sendPriceAlertIfLimitExceeded({
	values,
	blueprint,
	customerInfo,
}: {
	blueprint: {id: string; userName: string; name: string}
	values: {[key: string]: string}
	customerInfo: CustomerInfo
}) {
	if (!customerInfo.priceLimit) return
	const submittedPrice = values[customerInfo.priceLimit.fieldName]
	if (submittedPrice === undefined) return

	if (Number(submittedPrice) >= customerInfo.priceLimit.limit) {
		console.log('Sending email', blueprint, customerInfo.priceLimit.alertEmail)
		await sendMail({
			to: customerInfo.priceLimit.alertEmail,
			subject: 'FilloApp - Document with exceeding price was generated',
			html: `
				<p>New document named: <b>${blueprint.name}</b> with exceeding price was generated by <b>${blueprint.userName}</b></p>
			`,
		})
	}
}

export async function exportToSpreadsheet({
	dbClient,
	customerId,
	sheetId,
}: {
	dbClient: PoolClient
	customerId: string
	sheetId: string
}) {
	const submits = await getDataForSpreadsheetExport({
		customerId,
		dbClient,
	})

	const auth = await getOauth2ClientForServiceAccount()

	const sheets = google.sheets({version: 'v4', auth})

	const allFields = [
		...unique(
			submits
				.map((one) => one.fields)
				.reduce((curr, one) => [...curr, ...one], [])
				.sort()
		),
	]

	const values = [
		['name', 'submittedAt', 'submittedBy', 'projectName', ...allFields],
		...submits.map((oneSubmit) => {
			return [
				oneSubmit.name || '',
				oneSubmit.submittedAt || '',
				oneSubmit.submittedBy || '',
				oneSubmit.projectName || '',
				...allFields.map(
					(fieldName) =>
						oneSubmit.values.find((one: any) => one.name === fieldName)
							?.value || ''
				),
			]
		}),
	]

	const resource = {values}

	// await sheets.spreadsheets.batchUpdate({
	// 	spreadsheetId: sheetId,
	// 	fields: '*',
	// })

	await sheets.spreadsheets.values.clear({
		spreadsheetId: sheetId,
		range: 'Sheet1',
	})

	// @ts-ignore
	await sheets.spreadsheets.values.update({
		spreadsheetId: sheetId,
		range: 'Sheet1!A1',
		valueInputOption: 'RAW',
		resource,
	})

	// @ts-ignore
	await sheets.spreadsheets.batchUpdate({
		spreadsheetId: sheetId,
		requestBody: {
			requests: [
				{
					'autoResizeDimensions': {
						'dimensions': {
							'dimension': 'COLUMNS',
						},
					},
				},
			],
		},
	})

	return values
}
