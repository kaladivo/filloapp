import React, {createContext, ReactNode, useMemo, useContext} from 'react'
import {ApiService} from '.'
import {useLogout, getUser} from '../utils/auth'

const apiContext = createContext<ApiService>(
	new ApiService({
		getBearer: () => 'dummy',
		onBearerRefused: () => null,
	})
)

export function ApiProvider({children}: {children: ReactNode}) {
	const logout = useLogout()
	const apiService = useMemo(() => {
		return new ApiService({
			getBearer: () => getUser()?.accessToken || null,
			onBearerRefused: logout,
		})
	}, [logout])

	return (
		<apiContext.Provider value={apiService}>{children}</apiContext.Provider>
	)
}

export function useApiService() {
	return useContext(apiContext)
}

export default apiContext
