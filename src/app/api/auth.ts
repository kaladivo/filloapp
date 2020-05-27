import {AxiosResponse, AxiosInstance} from 'axios'

import * as authRoutes from '../../constants/api/auth'

export interface User {
	username: string
	accessToken: string
}

export default class ImportExportService {
	apiService: AxiosInstance

	constructor(apiService: AxiosInstance) {
		this.apiService = apiService
	}

	login = ({
		username,
		password,
	}: {
		username: string
		password: string
	}): Promise<AxiosResponse<User>> => {
		return this.apiService.post<any>(authRoutes.login, {username, password})
	}

	checkUser = (request: {bearer: string}): Promise<AxiosResponse<User>> => {
		return this.apiService.get<any>(authRoutes.login, {
			headers: {Authentication: `Bearer ${request.bearer}`},
		})
	}
}
