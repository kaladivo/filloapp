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

export interface FieldType {
	newValue: string
	template: string
	name: string
	compiledValue: string
}
