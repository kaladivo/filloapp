export interface BlueprintField {
	id: string
	name: string
	type: 'string'
}

export interface Blueprint {
	id: string
	googleDocsId: string
	name: string
	fields: BlueprintField[]
}
