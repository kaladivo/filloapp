import {AxiosResponse, AxiosInstance} from 'axios'

export default class BlueprintsService {
	apiService: AxiosInstance

	constructor(apiService: AxiosInstance) {
		this.apiService = apiService
	}

	// generateFilesFromData = ({
	// 	files,
	// 	keyMap,
	// }: {
	// 	files: FormFile
	// 	keyMap: FormFields
	// }): Promise<AxiosResponse<{url: string}>> => {
	// 	return this.apiService.post(formUrls.generateFilesFromData, {files, keyMap})
	// }
}
