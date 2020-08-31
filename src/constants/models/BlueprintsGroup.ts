import {BlueprintsGroupSubmit} from './BlueprintsGroupSubmit'
import {OwnerInfo} from './OwnerInfo'
import {Blueprint} from './Blueprint'

export interface GroupField {
	name: string
	types: string[]
	displayName: string
	helperText: string | null
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
