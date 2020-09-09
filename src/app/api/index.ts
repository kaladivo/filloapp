import {authAxiosInstanceFactory} from './axiosInstance'
import AuthService from './auth'
import BlueprintsService from './Blueprints'
import BlueprintsGroupsService from './BlueprintsGroups'
import CustomerInfoService from './customerInfo'
import EnvInfo from './envInfo'

export class ApiService {
	auth: AuthService
	blueprints: BlueprintsService
	blueprintsGroups: BlueprintsGroupsService
	customerInfo: CustomerInfoService
	envInfo: EnvInfo

	constructor({
		getBearer,
		onBearerRefused,
	}: {
		getBearer: () => string | null
		onBearerRefused: () => void
	}) {
		const axiosInstance = authAxiosInstanceFactory({getBearer, onBearerRefused})
		this.auth = new AuthService(axiosInstance)
		this.blueprints = new BlueprintsService(axiosInstance)
		this.blueprintsGroups = new BlueprintsGroupsService(axiosInstance)
		this.customerInfo = new CustomerInfoService(axiosInstance)
		this.envInfo = new EnvInfo(axiosInstance)
	}
}
