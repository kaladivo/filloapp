import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import {Severity} from '@sentry/types'
import UserInfo from '../../../constants/User'
import {
	gapiGetCurrentUserAuthToken,
	gapiIsSignedIn,
	gapiListenForUserChange,
	gapiLogoutUser,
	getStoredFilloBearer,
	parseToken,
	storeFilloBearer,
} from './utils'
import {ApiService} from '../../api'
import sentry from '../../utils/sentry'

export interface FilloUser {
	accessToken: string
	userInfo: UserInfo
}

interface AuthContext {
	user: FilloUser | null
	setBearer: (bearer: string) => void
	logout: () => void
	isLoggedIn: boolean
}

const authContext = React.createContext<AuthContext>({
	user: null,
	logout: () => undefined,
	setBearer: () => undefined,
	isLoggedIn: false,
})

function AuthProvider({children}: {children: React.ReactNode}) {
	const authApi = useMemo(
		() =>
			new ApiService({getBearer: () => null, onBearerRefused: () => undefined})
				.auth,
		[]
	)
	const [bearer, setBearer] = useState<string | null>(getStoredFilloBearer())

	const user: FilloUser | null = useMemo(() => {
		if (!bearer) return null
		return parseToken(bearer)
	}, [bearer])

	const isLoggedIn = useMemo(() => !!user, [user])

	const logout = useCallback(() => {
		gapiLogoutUser()
		setBearer(null)
		storeFilloBearer(null)
	}, [setBearer])

	const filloRefresh = useCallback(
		({
			bearer: bearerToUse,
			googleAccessToken,
		}: {
			bearer: string
			googleAccessToken: string
		}) => {
			authApi
				.refreshUser({bearer: bearerToUse, googleAccessToken})
				.then((response) => {
					setBearer(response.data.bearer)
				})
				.catch((e) => {
					sentry.captureException(e, {
						extra: {bearerToUse},
						level: Severity.Info,
					})
					console.warn('Error refreshing user. Logging out', e)
					logout()
				})
		},
		[setBearer, authApi, logout]
	)

	// On mount
	useEffect(() => {
		const isSignedIn = gapiIsSignedIn()

		// When google gives us new access token, refresh user
		const unregister = gapiListenForUserChange((newToken) => {
			const currentBearer = getStoredFilloBearer()
			console.info('User has changed. Refreshing', {newToken, currentBearer})
			if (newToken && currentBearer) {
				filloRefresh({googleAccessToken: newToken, bearer: currentBearer})
			} else if (!newToken) {
				logout()
			}
		})

		// TODO setup user checking in intervals

		const storedBearer = getStoredFilloBearer()
		const googleAccessToken = gapiGetCurrentUserAuthToken()

		if (!isSignedIn || !googleAccessToken || !storedBearer) {
			logout()
		} else {
			filloRefresh({googleAccessToken, bearer: storedBearer})
		}

		return unregister
	}, [filloRefresh, logout])

	useEffect(() => {
		storeFilloBearer(bearer)
	}, [bearer])

	const contextValue = {
		logout,
		user,
		isLoggedIn,
		setBearer,
	}

	return (
		<authContext.Provider value={contextValue}>{children}</authContext.Provider>
	)
}
export default AuthProvider

export function useUser(): FilloUser | null {
	return useContext(authContext).user
}

export function useLogout(): () => void {
	return useContext(authContext).logout
}

export function useGetUser(): () => FilloUser | null {
	const user = useUser()
	const userRef = useRef<FilloUser | null>(user)

	useEffect(() => {
		userRef.current = user
	}, [user])

	return () => userRef.current
}

export function useIsLoggedIn() {
	return useContext(authContext).isLoggedIn
}

export function useSetBearer() {
	return useContext(authContext).setBearer
}
