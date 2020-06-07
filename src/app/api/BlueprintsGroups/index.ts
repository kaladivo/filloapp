import {AxiosResponse, AxiosInstance} from 'axios'
import {BlueprintGroupSubmit} from './models'
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
	}: {
		name: string
		blueprintsIds: string[]
	}): Promise<AxiosResponse<BlueprintGroup>> => {
		return this.apiService.post(groupsUrls.createGroup, {name, blueprintsIds})
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

	get = ({id}: {id: string}): Promise<AxiosResponse<BlueprintGroup>> => {
		const url = groupsUrls.getBlueprintGroup.replace(':groupId', id)
		return this.apiService.get(url)
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
}
