import httpStatus from 'http-status-codes'
import {drive_v3 as driveV3} from 'googleapis'
// @ts-ignore
import matchAll from 'match-all'
import unique from 'array-unique'
import errorCodes from '../../../constants/errorCodes'
import SendableError from '../../utils/SendableError'

function findFields(text: string): string[] {
	const re = /\{{(.*?)\}}/g

	const fields = matchAll(text, re).toArray()
	return unique(fields)
}

export async function getFileMetadata({
	fileId,
	drive,
}: {
	fileId: string
	drive: driveV3.Drive
}): Promise<{name?: string | null; mimeType?: string | null}> {
	try {
		const fileData = await drive.files.get({fileId})
		return fileData.data
	} catch (e) {
		throw new SendableError(
			`Unable to access file with id: ${fileId}`,
			{
				status: httpStatus.BAD_REQUEST,
				errorCode: errorCodes.UNABLE_TO_GET_GOOGLE_FILE,
			},
			{error: e}
		)
	}
}

export async function getBlueprintFields({
	fileId,
	drive,
}: {
	fileId: string
	drive: driveV3.Drive
}): Promise<string[]> {
	try {
		const response: any = await drive.files.export({
			fileId,
			mimeType: 'text/plain',
		})
		return findFields(response.data)
	} catch (e) {
		throw new SendableError(
			`Unable to access file with id: ${fileId}`,
			{
				status: httpStatus.BAD_REQUEST,
				errorCode: errorCodes.UNABLE_TO_GET_GOOGLE_FILE,
			},
			{error: e}
		)
	}
}
