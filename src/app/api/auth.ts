import {AxiosResponse, AxiosInstance} from 'axios'
import User from '../../constants/User'

import * as authRoutes from '../../constants/api/auth'

export default class ImportExportService {
	apiService: AxiosInstance

	constructor(apiService: AxiosInstance) {
		this.apiService = apiService
	}

	login = ({
		code,
	}: {
		code: string
	}): Promise<AxiosResponse<{bearer: string}>> => {
		return this.apiService.post<any>(authRoutes.login, {code})
	}

	checkUser = (request: {bearer: string}): Promise<AxiosResponse<User>> => {
		return this.apiService.get<any>(authRoutes.login, {
			headers: {Authentication: `Bearer ${request.bearer}`},
		})
	}
}
