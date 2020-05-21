import {authAxiosInstanceFactory} from './axiosInstance'
import {getUser, cleanUser} from '../utils/auth'
import AuthService from './auth'
import FormsService from './forms'

export class ApiService {
	auth: AuthService
	forms: FormsService

	constructor({
		getBearer,
		onBearerRefused,
	}: {
		getBearer: () => string | null
		onBearerRefused: () => void
	}) {
		const axiosInstance = authAxiosInstanceFactory({getBearer, onBearerRefused})
		this.auth = new AuthService(axiosInstance)
		this.forms = new FormsService(axiosInstance)
	}
}

export default new ApiService({
	getBearer: () => getUser()?.accessToken || null,
	onBearerRefused: cleanUser,
})
