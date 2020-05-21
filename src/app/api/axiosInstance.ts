import axios from 'axios'

const baseUrl: string = process.env.API_URL || '/api'
const timeout: number = Number(process.env.API_TIMEOUT || 120000)

const apiService = axios.create({
	baseURL: `${baseUrl}`,
	timeout,
	headers: {'Content-Type': 'application/json'},
})

function authAxiosInstanceFactory({
	getBearer,
	onBearerRefused,
}: {
	getBearer: () => string | null
	onBearerRefused: () => void
}) {
	const authApiService = axios.create({
		baseURL: `${baseUrl}`,
		timeout,
		headers: {
			'Content-Type': 'application/json',
		},
	})

	// Add bearer to request
	authApiService.interceptors.request.use(
		(config) => {
			const bearer = getBearer()
			if (bearer) {
				config.headers = {
					...config.headers,
					Authorization: `Bearer ${getBearer()}`,
				}
			}

			return config
		},
		(error) => Promise.reject(error)
	)

	authApiService.interceptors.response.use(
		(response) => response,
		(error) => {
			if (error.response?.status === 401) onBearerRefused()
			return Promise.reject(error)
		}
	)

	return authApiService
}

export default apiService
export {authAxiosInstanceFactory}
