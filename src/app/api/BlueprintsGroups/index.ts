import {AxiosResponse, AxiosInstance} from 'axios'
import {BlueprintGroupSubmit, FieldType} from './models'
import {
	BlueprintGroup,
	BlueprintsGroupPreview,
} from '../../../constants/models/BlueprintsGroup'

import {PaginationPosition} from '../../../constants/models/Pagination'
import * as groupsUrls from '../../../constants/api/blueprintsGroups'

export default class BlueprintsGroupsService {
	apiService: AxiosInstance

	constructor(apiService: AxiosInstance) {
		this.apiService = apiService
	}

	create = ({
		name,
		blueprintsIds,
		projectName,
	}: {
		name: string
		blueprintsIds: string[]
		projectName: string
	}): Promise<AxiosResponse<BlueprintGroup>> => {
		return this.apiService.post(groupsUrls.createGroup, {
			name,
			blueprintsIds,
			projectName,
		})
	}

	list = ({
		pagination,
	}: {
		pagination: PaginationPosition
	}): Promise<AxiosResponse<BlueprintsGroupPreview[]>> => {
		return this.apiService.get(groupsUrls.listBlueprintGroup, {
			params: pagination,
		})
	}

	search = ({
		query,
		pagination,
	}: {
		query: string
		pagination: PaginationPosition
	}): Promise<AxiosResponse<BlueprintsGroupPreview[]>> => {
		return this.apiService.get(groupsUrls.search, {
			params: {...pagination, query},
		})
	}

	get = ({id}: {id: string}): Promise<AxiosResponse<BlueprintGroup>> => {
		const url = groupsUrls.getBlueprintGroup.replace(':groupId', id)
		return this.apiService.get(url)
	}

	delete = ({id}: {id: string}): Promise<AxiosResponse<number>> => {
		const url = groupsUrls.deleteBlueprintGroup.replace(':groupId', id)
		return this.apiService.delete(url)
	}

	submit = ({
		id,
		data,
	}: {
		id: string
		data: BlueprintGroupSubmit
	}): Promise<AxiosResponse<BlueprintGroup>> => {
		const url = groupsUrls.submit.replace(':groupId', id)
		return this.apiService.post(url, data)
	}

	getNextIncValue = ({
		fieldTypeName,
	}: {
		fieldTypeName: string
	}): Promise<AxiosResponse<FieldType>> => {
		const url = groupsUrls.getFieldValue.replace(':fieldType', fieldTypeName)
		return this.apiService.get(url)
	}
}
