import {OwnerInfo} from './OwnerInfo'
import {Blueprint} from './Blueprint'

export interface GroupField {
	name: string
	types: string[]
}

export interface BlueprintGroup {
	id: string
	name: string
	createdAt: string
	owner: OwnerInfo
	fields: GroupField
	blueprints: Blueprint[]
}

export interface BlueprintsGroupPreview {
	id: string
	name: string
	createdAt: string
	owner: OwnerInfo
}
