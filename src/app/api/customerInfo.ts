import {AxiosResponse, AxiosInstance} from 'axios'
import {CustomerInfo} from '../../constants/models/customerInfo'

import * as customerInfoRoutes from '../../constants/api/customerInfo'

export default class CustomerInfoService {
	apiService: AxiosInstance

	constructor(apiService: AxiosInstance) {
		this.apiService = apiService
	}

	getCustomerInfo = (): Promise<AxiosResponse<CustomerInfo>> => {
		return this.apiService.get<any>(customerInfoRoutes.getCustomerInfo)
	}
}
