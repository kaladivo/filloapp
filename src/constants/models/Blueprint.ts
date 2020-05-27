import {OwnerInfo} from './OwnerInfo'

export interface BlueprintField {
	id: string
	name: string
	type: 'string'
}

export interface Blueprint {
	id: string
	googleDocsId: string
	owner: OwnerInfo
	name: string
	fields: BlueprintField[]
}
