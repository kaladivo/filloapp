import {drive_v3 as driveV3, docs_v1 as docsV1} from 'googleapis'
import {Stream} from 'stream'
import {Blueprint} from '../../../constants/models/Blueprint'

// const TEMP_FOLDER: string = String(process.env.TEMP_FOLDER)

export interface Tokens {
	accessToken?: string
	refreshToken?: string
}

async function copyFile({
	sourceId,
	name,
	targetFolderId,
	drive,
}: {
	sourceId: string
	name: string
	targetFolderId: string
	drive: driveV3.Drive
}): Promise<string> {
	const result = await drive.files.copy({
		fileId: sourceId,
		requestBody: {
			name,
			parents: [targetFolderId],
		},
	})

	return result.data.id || '0'
}

export async function canUserRead({
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

export async function generateFilledDocument({
	blueprint,
	targetFolderId,
	fileName,
	values,
	drive,
	docs,
}: {
	blueprint: Blueprint
	fileName: string
	values: any
	targetFolderId: string
	drive: driveV3.Drive
	docs: docsV1.Docs
}): Promise<string> {
	const createdFileId = await copyFile({
		drive,
		name: fileName,
		sourceId: blueprint.googleDocsId,
		targetFolderId,
	})

	await replaceTemplateStrings({
		documentId: createdFileId,
		docs,
		keyMap: values,
	})

	return createdFileId
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
