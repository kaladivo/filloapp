import {AxiosResponse, AxiosInstance} from 'axios'

import * as authRoutes from '../../constants/api/auth'

export default class ImportExportService {
	apiService: AxiosInstance

	constructor(apiService: AxiosInstance) {
		this.apiService = apiService
	}

	loginWithAccessToken = ({googleAccessToken}: {googleAccessToken: string}) => {
		return this.apiService.post<any>(authRoutes.login, {googleAccessToken})
	}

	checkUser = (request: {
		bearer: string
	}): Promise<AxiosResponse<{bearer: string}>> => {
		return this.apiService.get<any>(authRoutes.checkUser, {
			headers: {Authentication: `Bearer ${request.bearer}`},
		})
	}
}
