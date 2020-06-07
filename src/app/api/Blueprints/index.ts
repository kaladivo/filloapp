import {AxiosResponse, AxiosInstance} from 'axios'
import {TinyBlueprint} from '../../../constants/models/Blueprint'
import * as blueprintsUrls from '../../../constants/api/blueprints'

export default class BlueprintsService {
	apiService: AxiosInstance

	constructor(apiService: AxiosInstance) {
		this.apiService = apiService
	}

	listBlueprints = (): Promise<AxiosResponse<TinyBlueprint[]>> => {
		return this.apiService.get(blueprintsUrls.listBlueprintsTiny)
	}
}
