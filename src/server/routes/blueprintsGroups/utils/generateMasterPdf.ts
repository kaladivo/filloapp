import * as fs from 'fs'
// @ts-ignore
import hummus from 'hummus'
import {drive_v3 as driveV3} from 'googleapis'
import {uid} from 'rand-token'
import sentry from '../../../utils/sentry'

const tempFolder = process.env.TEMP_FOLDER as string

export function generateMasterPdf() {}

async function streamToFile({path, stream}: any) {
	const dest = fs.createWriteStream(path)

	return new Promise((resolve, reject) => {
		stream
			.on('error', reject)
			.pipe(dest)
			.on('error', reject)
			.on('finish', resolve)
	})
}

function silentCleanup(folderName: string) {
	try {
		fs.rmdirSync(folderName, {recursive: true})
	} catch (e) {
		console.warn(
			'Generating combined pdf',
			`Unable to remove ${folderName}. Failing silently`
		)
		// silent
	}
}

async function createCombinedFile({
	paths,
	outFilePath,
}: {
	paths: string[]
	outFilePath: string
}) {
	const pdfWriter = hummus.createWriter(outFilePath)
	paths.forEach((path) => pdfWriter.appendPDFPagesFromPDF(path))
	pdfWriter.end()
}

async function uploadPdfToDrive({
	drive,
	filePath,
	folderId,
	fileName,
}: {
	drive: driveV3.Drive
	filePath: string
	folderId: string
	fileName: string
}): Promise<string> {
	const fileStream = fs.createReadStream(filePath)

	// @ts-ignore
	const {id} = await drive.files.create({
		media: {
			mimeType: 'application/pdf',
			body: fileStream,
		},
		resource: {
			name: fileName,
			mimeType: 'application/pdf',
			parents: [folderId],
		},
	})

	return id
}

async function downloadFile({
	drive,
	fileId,
	path,
}: {
	drive: driveV3.Drive
	fileId: string
	path: string
}) {
	const res = await drive.files.export(
		{
			fileId,
			mimeType: 'application/pdf',
		},
		{responseType: 'stream'}
	)
	await streamToFile({path, stream: res.data})
}

function generateTempFolderName(): string {
	const folderName = `${tempFolder}/${Date.now()}${uid(6)}`

	if (fs.existsSync(folderName)) return generateTempFolderName()
	return folderName
}

export async function createAndUploadCombinedPdf({
	drive,
	docsIds,
	folderId,
	resultName,
}: {
	drive: driveV3.Drive
	docsIds: string[]
	folderId: string
	resultName: string
}): Promise<string> {
	console.info('Generating combined pdf', {docsIds, folderId})
	const folderName = generateTempFolderName()

	try {
		console.info(
			'Generating combined pdf',
			`Creating local temporary folder: ${folderName}`
		)
		fs.mkdirSync(folderName)
		const filesPaths = docsIds.map((_, i) => `${folderName}/file${i}.pdf`)
		console.info(
			'Generating combined pdf',
			`Folder generated. Prepared files names: ${filesPaths.join(',')}`
		)

		console.info(
			'Generating combined pdf',
			`Downloading ${filesPaths.length} files`
		)
		await Promise.all(
			docsIds.map(async (docId, i) => {
				await downloadFile({drive, fileId: docId, path: filesPaths[i]})
			})
		)

		console.info('Generating combined pdf', 'Files successfully downloaded')
		const combinedFilePath = `${folderName}/combined.pdf`
		console.info(
			'Generating combined pdf',
			`Combining all pdfs into one. Target file: ${combinedFilePath}`
		)
		await createCombinedFile({paths: filesPaths, outFilePath: combinedFilePath})

		console.info(
			'Generating combined pdf',
			'Uploading combined pdf to drive folder'
		)
		const generatedFileId = await uploadPdfToDrive({
			drive,
			filePath: combinedFilePath,
			folderId,
			fileName: resultName,
		})
		console.info(
			'Generating combined pdf',
			`Combined pdf generated and uploaded (id: ${generatedFileId})`
		)
		return generatedFileId
	} catch (e) {
		sentry.captureException(e)
		console.error(
			'Generating combined pdf',
			'Error while generating combined pdf',
			e
		)
		throw e
	} finally {
		console.info(
			'Generating combined pdf',
			`Cleaning up temporary files. Removing folder ${folderName}`
		)
		silentCleanup(folderName)
		console.info('Generating combined pdf', `Folder ${folderName} removed`)
	}
}
