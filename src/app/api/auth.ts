import {AxiosResponse, AxiosInstance} from 'axios'

import * as authRoutes from '../../constants/api/auth'

export default class ImportExportService {
	apiService: AxiosInstance

	constructor(apiService: AxiosInstance) {
		this.apiService = apiService
	}

	// TODO change
	login = ({
		code,
	}: {
		code: string
	}): Promise<AxiosResponse<{bearer: string}>> => {
		return this.apiService.post<any>(authRoutes.login, {code})
	}

	checkUser = (request: {
		bearer: string
	}): Promise<AxiosResponse<{bearer: string}>> => {
		return this.apiService.get<any>(authRoutes.checkUser, {
			headers: {Authentication: `Bearer ${request.bearer}`},
		})
	}
}
