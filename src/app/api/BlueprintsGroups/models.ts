export interface SubmitSettings {
	outputName: string
	generatePdfs: boolean
	generateMasterPdf: boolean
	outputFolderId: string
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
