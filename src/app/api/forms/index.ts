import {AxiosResponse, AxiosInstance} from 'axios'
import * as formUrls from '../../../constants/api/forms'
import {FormFile, FormFields} from './model'

export default class ActivationCodesService {
	apiService: AxiosInstance

	constructor(apiService: AxiosInstance) {
		this.apiService = apiService
	}

	generateFilesFromData = ({
		files,
		keyMap,
	}: {
		files: FormFile
		keyMap: FormFields
	}): Promise<AxiosResponse<{url: string}>> => {
		return this.apiService.post(formUrls.generateFilesFromData, {files, keyMap})
	}
}
