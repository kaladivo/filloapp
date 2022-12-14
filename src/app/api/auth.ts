import {AxiosResponse, AxiosInstance} from 'axios'

import * as authRoutes from '../../constants/api/auth'
import Customer from '../../constants/models/Customer'

export default class ImportExportService {
	apiService: AxiosInstance

	constructor(apiService: AxiosInstance) {
		this.apiService = apiService
	}

	loginWithAccessToken = ({googleAccessToken}: {googleAccessToken: string}) => {
		return this.apiService.post<{bearer: string}>(authRoutes.login, {
			googleAccessToken,
		})
	}

	refreshUser = ({
		bearer,
		googleAccessToken,
	}: {
		bearer: string
		googleAccessToken: string
	}): Promise<AxiosResponse<{bearer: string}>> => {
		return this.apiService.post(
			authRoutes.refreshUser,
			{googleAccessToken},
			{headers: {'Authorization': bearer}}
		)
	}

	checkUser = (request: {
		bearer: string
	}): Promise<AxiosResponse<{bearer: string}>> => {
		return this.apiService.get<any>(authRoutes.checkUser, {
			headers: {Authentication: `Bearer ${request.bearer}`},
		})
	}

	listUserCustomers = () => {
		return this.apiService.get<Customer[]>(authRoutes.listUserCustomers)
	}

	selectCustomer = ({customerId}: {customerId: string}) => {
		return this.apiService.post<{newBearer: string}>(
			authRoutes.selectCustomer,
			{customerId}
		)
	}
}
