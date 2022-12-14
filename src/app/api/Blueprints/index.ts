import {AxiosResponse, AxiosInstance} from 'axios'
import {
	Blueprint,
	BlueprintField,
	TinyBlueprint,
} from '../../../constants/models/Blueprint'
import * as blueprintsUrls from '../../../constants/api/blueprints'
import {PaginationPosition} from '../../../constants/models/Pagination'

export interface CreateBlueprintRequest {
	name?: string
	fileId: string
	isSubmitted: boolean
	fieldsOptions: BlueprintField[]
}

export interface updateBlueprintRequest {
	name?: string
	blueprintId: string
	fieldsOptions: BlueprintField[]
}

export interface SearchBlueprintsRequest {
	onlySubmitted: boolean
	query: string
}

export default class BlueprintsService {
	apiService: AxiosInstance

	constructor(apiService: AxiosInstance) {
		this.apiService = apiService
	}

	create = (
		request: CreateBlueprintRequest
	): Promise<AxiosResponse<Blueprint>> => {
		return this.apiService.post(blueprintsUrls.createBlueprint, request)
	}

	update = (
		request: updateBlueprintRequest
	): Promise<AxiosResponse<Blueprint>> => {
		return this.apiService.put(blueprintsUrls.updateBlueprint, request)
	}

	search = (
		request: SearchBlueprintsRequest
	): Promise<AxiosResponse<Blueprint[]>> => {
		return this.apiService.get(blueprintsUrls.searchBlueprints, {
			params: request,
		})
	}

	get = ({
		blueprintId,
	}: {
		blueprintId: string
	}): Promise<AxiosResponse<Blueprint>> => {
		return this.apiService.get(
			blueprintsUrls.getBlueprint.replace(':blueprintId', blueprintId)
		)
	}

	listTiny = ({
		onlySubmitted,
	}: {
		onlySubmitted: boolean
	}): Promise<AxiosResponse<TinyBlueprint[]>> => {
		return this.apiService.get(blueprintsUrls.listBlueprintsTiny, {
			params: {onlySubmitted},
		})
	}

	list = ({
		onlySubmitted,
		pagination,
	}: {
		onlySubmitted: boolean
		pagination: PaginationPosition
	}): Promise<AxiosResponse<Blueprint[]>> => {
		return this.apiService.get(blueprintsUrls.listBlueprints, {
			params: {onlySubmitted, ...pagination},
		})
	}

	delete = ({
		blueprintId,
	}: {
		blueprintId: string
	}): Promise<AxiosResponse<{deleted: string}>> => {
		return this.apiService.delete(
			blueprintsUrls.deleteBlueprint.replace(':blueprintId', blueprintId)
		)
	}
}
