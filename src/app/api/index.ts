import {AxiosInstance} from 'axios'
import {authAxiosInstanceFactory} from './axiosInstance'
import AuthService from './auth'
import BlueprintsService from './Blueprints'
import BlueprintsGroupsService from './BlueprintsGroups'
import CustomerInfoService from './customerInfo'
import EnvInfo from './envInfo'
import Ares from './Ares'

export class ApiService {
	auth: AuthService
	blueprints: BlueprintsService
	blueprintsGroups: BlueprintsGroupsService
	customerInfo: CustomerInfoService
	envInfo: EnvInfo
	ares: Ares

	_axiosInstance: AxiosInstance

	constructor({
		getBearer,
		onBearerRefused,
	}: {
		getBearer: () => string | null
		onBearerRefused: () => void
	}) {
		const axiosInstance = authAxiosInstanceFactory({getBearer, onBearerRefused})
		this._axiosInstance = axiosInstance
		this.auth = new AuthService(axiosInstance)
		this.blueprints = new BlueprintsService(axiosInstance)
		this.blueprintsGroups = new BlueprintsGroupsService(axiosInstance)
		this.customerInfo = new CustomerInfoService(axiosInstance)
		this.envInfo = new EnvInfo(axiosInstance)
		this.ares = new Ares(axiosInstance)
	}

	testSentry = () => {
		return this._axiosInstance.get('/test-sentry')
	}
}
