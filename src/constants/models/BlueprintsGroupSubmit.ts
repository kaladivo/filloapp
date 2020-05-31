import {OwnerInfo} from './OwnerInfo'

export interface GeneratedDocument {
	id: string
	name: string
	googleDocId: string
	pdfId: string
}

export interface FilledValue {
	name: string
	value: string
	type: string
}

export interface BlueprintsGroupSubmit {
	id: string
	submittedAt: string
	folderId: string
	byUser: OwnerInfo
	filledValues: Array<FilledValue>
	generatedFiles: Array<GeneratedDocument>
}
