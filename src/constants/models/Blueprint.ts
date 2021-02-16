import {OwnerInfo} from './OwnerInfo'

export type BlueprintFieldType = 'string' | 'id' | 'date' | 'number' | 'select'

export interface BlueprintField {
	id: string
	name: string
	type: BlueprintFieldType
	displayName: string
	helperText: string
	options: any
}

export interface Blueprint {
	id: string
	googleDocsId: string
	owner: OwnerInfo
	name: string
	fields: BlueprintField[]
	isSubmitted: boolean
}

export interface TinyBlueprint {
	id: string
	name: string
}
