import {BlueprintsGroupSubmit} from './BlueprintsGroupSubmit'
import {OwnerInfo} from './OwnerInfo'
import {Blueprint} from './Blueprint'

export interface GroupField {
	name: string
	types: string[]
	displayName: string
	helperText: string | null
	options: any
}

export interface BlueprintGroup {
	id: string
	name: string
	createdAt: string
	projectName: string
	owner: OwnerInfo
	fields: GroupField[]
	blueprints: Blueprint[]
	submits: BlueprintsGroupSubmit[]
}

export interface BlueprintsGroupPreview {
	id: string
	name: string
	createdAt: string
	projectName: string
	owner: OwnerInfo
}

export interface SubmitSettings {
	outputName: string
	generatePdfs: boolean
	generateMasterPdf: boolean
	removeOldVersion: boolean
	generateDocuments: boolean
	outputFolder?: {
		id: string
		name?: string
	}
}

export interface BlueprintGroupSubmit {
	values: {
		[field: string]: {
			type: string
			value: string
		}
	}
	settings: SubmitSettings
}

export interface IdFieldValue {
	newValue: string
	template: string
	name: string
	compiledValue: string
}
