import {OwnerInfo} from './OwnerInfo'

export type BlueprintFieldType =
	| 'string'
	| 'id'
	| 'date'
	| 'number'
	| 'select'
	| 'ares'

export type BlueprintFieldOptions = {[key: string]: any}

export interface BlueprintField {
	id: string
	name: string
	type: BlueprintFieldType
	displayName: string
	helperText: string
	options: BlueprintFieldOptions
	defaultValue: string | null
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
