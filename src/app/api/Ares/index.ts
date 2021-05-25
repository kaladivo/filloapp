import {AxiosInstance, AxiosPromise} from 'axios'

import * as aresUrls from '../../../constants/api/ares'

interface AresResponse {
	name: string
	ico: string
	okres: string
	obec: string
	castObce: string
	mestskaCast: string
	ulice: string
	domovni: string
	orientacni: string
	psc: string
	dic: string | null
}

export default class Ares {
	apiService: AxiosInstance

	constructor(apiService: AxiosInstance) {
		this.apiService = apiService
	}

	getByIco = ({ico}: {ico: string}): AxiosPromise<AresResponse> => {
		return this.apiService.get(aresUrls.getAres.replace(':ico', ico))
	}
}
