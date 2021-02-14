import React, {createContext, ReactNode, useMemo, useContext} from 'react'
import {ApiService} from '.'
import {useLogout, useGetUser} from '../components/AuthProvider'

const dummyValue = new ApiService({
	getBearer: () => 'dummy',
	onBearerRefused: () => null,
})

const apiContext = createContext<ApiService>(dummyValue)

export function ApiProvider({children}: {children: ReactNode}) {
	const logout = useLogout()
	const getUser = useGetUser()

	const apiService = useMemo(() => {
		return new ApiService({
			getBearer: () => getUser()?.accessToken || null,
			onBearerRefused: logout,
		})
	}, [logout, getUser])

	return (
		<apiContext.Provider value={apiService}>{children}</apiContext.Provider>
	)
}

export function useApiService() {
	return useContext(apiContext)
}

export default apiContext
