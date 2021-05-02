import axios from 'axios'

// This will always fallback to default vars
const baseUrl: string = process.env.API_URL || '/api'
const timeout: number = Number(process.env.API_TIMEOUT || 120000)

const version: string = process.env.REACT_APP_VERSION || 'unknown'

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
			'X-Client-Version': version,
		},
	})

	// Add bearer and version to request
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

export {authAxiosInstanceFactory}
