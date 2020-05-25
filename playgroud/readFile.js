/* eslint-disable */
const {google} = require('googleapis')
const {authorize} = require('./authorize')
const matchAll = require('match-all')
const unique = require('array-unique')

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
	const drive = google.drive({version: 'v3', auth})
	drive.files.list(
		{
			pageSize: 10,
			fields: 'nextPageToken, files(id, name)',
		},
		(err, res) => {
			if (err) return console.log(`The API returned an error: ${err}`)
			const {files} = res.data
			if (files.length) {
				console.log('Files:')
				files.map((file) => {
					console.log(`${file.name} (${file.id})`)
				})
			} else {
				console.log('No files found.')
			}
		}
	)
}

function findFields(text) {
	const re = /\{{(.*?)\}}/g

	const fields = matchAll(text, re).toArray()

	console.log(unique(fields))
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getFileContents(auth) {
	const drive = google.drive({version: 'v3', auth})
	drive.files
		.export({
			'fileId': '1STHa5LirtdT0QXKehgqD0X7ZXOXQMHEAXHOPTY6g2NU',
			'mimeType': 'text/plain',
		})
		.then(
			function (success) {
				findFields(success.data)
				//success.result
			},
			function (fail) {
				console.log(fail)
				console.log('Error ' + fail.result.error.message)
			}
		)
}

/**
 * Prints the title of a sample doc:
 * https://docs.google.com/document/d/195j9eDD3ccgjQRttHhJPymLJUCOUjs-jmwTrekvdjFE/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth 2.0 client.
 */
function printDocTitle(auth) {
	const docs = google.docs({version: 'v1', auth})
	docs.documents.get(
		{
			documentId: '1STHa5LirtdT0QXKehgqD0X7ZXOXQMHEAXHOPTY6g2NU',
		},
		(err, res) => {
			if (err) return console.log('The API returned an error: ' + err)
			console.log(res.data.body)
			console.log(`The title of the document is: ${res.data.title}`)
		}
	)
}

authorize().then(getFileContents)
