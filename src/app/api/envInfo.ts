import {AxiosResponse, AxiosInstance} from 'axios'
import {EnvInfo} from '../../constants/models/EnvInfo'

import * as envInfoRoutes from '../../constants/api/envInfo'

export default class CustomerInfoService {
	apiService: AxiosInstance

	constructor(apiService: AxiosInstance) {
		this.apiService = apiService
	}

	getEnvInfo = (): Promise<AxiosResponse<EnvInfo>> => {
		return this.apiService.get<any>(envInfoRoutes.getEnvInfo)
	}
}
