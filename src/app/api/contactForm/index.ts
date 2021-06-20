import {AxiosResponse, AxiosInstance} from 'axios'
import {submitContactForm} from '../../../constants/api/contactForm'

interface ContactFormRequest {
	name: string
	mail: string
	phoneNumber: string
	message: string
}

export default class ContactForm {
	apiService: AxiosInstance

	constructor(apiService: AxiosInstance) {
		this.apiService = apiService
	}

	submitContactForm = (
		req: ContactFormRequest
	): Promise<AxiosResponse<void>> => {
		return this.apiService.post<any>(submitContactForm, req)
	}
}
