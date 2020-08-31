import {OwnerInfo} from './OwnerInfo'

export interface BlueprintField {
	id: string
	name: string
	type: 'string' | 'id'
	displayName: string
	helperText: string
}

export interface Blueprint {
	id: string
	googleDocsId: string
	owner: OwnerInfo
	name: string
	fields: BlueprintField[]
}

export interface TinyBlueprint {
	id: string
	name: string
}
