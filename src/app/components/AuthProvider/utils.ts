import jwt from 'jsonwebtoken'
import UserInfo from '../../../constants/User'
import {FilloUser} from './index'

const KEY_CURRENT_BEARER = 'fillo_user'

export interface GapiUser {
	accessToken: string
	email: string
}

export function gapiGetCurrentUserAuthToken() {
	// TODO return correct auth token
	// @ts-ignore
	return (
		window.gapi.auth2
			.getAuthInstance()
			?.currentUser?.get()
			// eslint-disable-next-line camelcase
			?.getAuthResponse()?.access_token
	)
}

export function gapiListenForUserChange(
	callback: (accessToken?: string) => void
) {
	// @ts-ignore
	window.triggerGapiRefresh = () => {
		const accessToken = gapiGetCurrentUserAuthToken()
		callback(accessToken)
	}

	// @ts-ignore
	return window.gapi.auth2.getAuthInstance().currentUser.listen((user: any) =>
		// eslint-disable-next-line camelcase
		callback(user?.getAuthResponse()?.access_token)
	).remove
}

export function gapiLogoutUser() {
	// @ts-ignore
	return window.gapi.auth2.getAuthInstance().signOut()
}

export function gapiIsSignedIn() {
	// @ts-ignore
	return window.gapi.auth2.getAuthInstance().isSignedIn.get()
}

export function parseToken(accessToken: string): FilloUser {
	// TODO check if bearer is valid
	const userInfo = jwt.decode(accessToken) as UserInfo
	return {accessToken, userInfo}
}

export function storeFilloBearer(bearer: string | null) {
	if (bearer) localStorage.setItem(KEY_CURRENT_BEARER, bearer)
	else localStorage.removeItem(KEY_CURRENT_BEARER)
}

export function getStoredFilloBearer(): string | null {
	return localStorage.getItem(KEY_CURRENT_BEARER)
}
