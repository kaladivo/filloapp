import {drive_v3 as driveV3} from 'googleapis'
// @ts-ignore
import matchAll from 'match-all'
import unique from 'array-unique'

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
	const fileData = await drive.files.get({fileId})
	return fileData.data
}

export async function getBlueprintFields({
	fileId,
	drive,
}: {
	fileId: string
	drive: driveV3.Drive
}): Promise<string[]> {
	const response: any = await drive.files.export({
		fileId,
		mimeType: 'text/plain',
	})
	return findFields(response.data)
}
