const moment = require('moment')
const {google} = require('googleapis')
const fs = require('fs')
const hummus = require('hummus')
const {uid} = require('rand-token')

const token = JSON.parse(process.env.GOOGLEAPIS_TOKEN || '{}')
const credentials = JSON.parse(process.env.GOOGLEAPIS_CREDENTIALS || '{}')
const tempFolder = process.env.TEMP_FOLDER || __dirname

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize(credentialsToUse) {
	// eslint-disable-next-line camelcase
	const {client_secret, client_id, redirect_uris} = credentialsToUse.installed
	const oAuth2Client = new google.auth.OAuth2(
		client_id,
		client_secret,
		redirect_uris[0]
	)
	oAuth2Client.setCredentials(token)
	return oAuth2Client
}

async function streamToFile({path, stream}) {
	const dest = fs.createWriteStream(path)

	return new Promise((resolve, reject) => {
		stream
			.on('error', reject)
			.pipe(dest)
			.on('error', reject)
			.on('finish', resolve)
	})
}

function generateRequestsToFilloutTemplate(keyMap) {
	return Object.keys(keyMap).map((key) => {
		return {
			replaceAllText: {
				containsText: {text: `{{${key}}}`, matchCase: true},
				replaceText: keyMap[key],
			},
		}
	})
}

async function createFromTemplate({
	docs,
	drive,
	keyMap,
	fileId,
	fileName,
	folderId,
}) {
	const copyTitle = fileName.replace(
		'{{date}}',
		moment().format('DD.MM. YYYY HH:mm')
	)
	const replaceTextRequests = generateRequestsToFilloutTemplate(keyMap)

	const copied = await drive.files.copy({
		fileId,
		resource: {name: copyTitle, parents: [folderId]},
	})

	await drive.permissions.create({
		fileId: copied.data.id,
		requestBody: {role: 'reader', type: 'anyone'},
	})

	await docs.documents.batchUpdate({
		documentId: copied.data.id,
		resource: {requests: replaceTextRequests},
	})

	return copied.data.id
}

async function downloadFile({drive, fileId, path}) {
	const res = await drive.files.export(
		{
			fileId,
			mimeType: 'application/pdf',
		},
		{responseType: 'stream'}
	)
	await streamToFile({path, stream: res.data})
}

async function createCombinedFile({paths, outFilePath}) {
	const pdfWriter = hummus.createWriter(outFilePath)
	paths.forEach((path) => pdfWriter.appendPDFPagesFromPDF(path))
	pdfWriter.end()
}

async function uploadPdfToDrive({drive, filePath, folderId}) {
	const fileStream = fs.createReadStream(filePath)

	await drive.files.create({
		media: {
			mimeType: 'application/pdf',
			body: fileStream,
		},
		resource: {
			name: `Sloučené smlouvy`,
			mimeType: 'application/pdf',
			parents: [folderId],
		},
	})
}

function generateTempFolderName() {
	const folderName = `${tempFolder}/${Date.now()}${uid(6)}`

	if (fs.existsSync(folderName)) return generateTempFolderName()
	return folderName
}

function silentCleanup(folderName) {
	try {
		fs.rmdirSync(folderName, {recursive: true})
		console.info('Cleanup successful')
	} catch (e) {
		console.warn(`Unable to remove ${folderName}`)
		// silent
	}
}

async function createAndUploadCombinedPdf({drive, docsIds, folderId}) {
	const folderName = generateTempFolderName()

	try {
		fs.mkdirSync(folderName)
		const filesPaths = docsIds.map((_, i) => `${folderName}/file${i}.pdf`)

		await Promise.all(
			docsIds.map(async (docId, i) => {
				await downloadFile({drive, fileId: docId, path: filesPaths[i]})
			})
		)

		const combinedFilePath = `${folderName}/combined.pdf`
		await createCombinedFile({paths: filesPaths, outFilePath: combinedFilePath})

		await uploadPdfToDrive({drive, filePath: combinedFilePath, folderId})
		console.info('done')
	} catch (e) {
		console.error('unable to upload pdf file')

		console.error(e)
		throw e
	} finally {
		silentCleanup(folderName)
	}
}

exports.createFilesFromRequest = async function createFilesFromRequest({
	keyMap,
	files,
}) {
	const auth = await authorize(credentials)
	const docs = google.docs({version: 'v1', auth})
	const drive = google.drive({version: 'v3', auth})

	const driveFolder = await drive.files.create({
		resource: {
			name: moment().format('DD.MM. YYYY HH:mm'),
			mimeType: 'application/vnd.google-apps.folder',
			parents: ['1yMxceHJHHUzuRXY3i6enAtFTGuipa3j8'],
		},
		fields: 'webViewLink, id',
	})

	const createdFilesIds = await Promise.all(
		files.map(async ({name, id}) => {
			return createFromTemplate({
				docs,
				drive,
				keyMap,
				fileId: id,
				fileName: name,
				folderId: driveFolder.data.id,
			})
		})
	)

	await createAndUploadCombinedPdf({
		drive,
		docsIds: createdFilesIds,
		folderId: driveFolder.data.id,
	})

	return {url: driveFolder.data.webViewLink}
}
