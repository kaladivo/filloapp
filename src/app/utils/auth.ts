import {useState, useEffect, useCallback} from 'react'
import sysend from 'sysend'
import jwt from 'jsonwebtoken'
import UserInfo from '../../constants/User'

const KEY_BROADCAST_AUTH = 'AUTH_BROADCAST'
const KEY_LOCAL_STORAGE = 'AUTH_LOCAL_STORAGE'

export interface User {
	accessToken: string
	userInfo: UserInfo
}

class UserStore {
	_user: User | null

	constructor() {
		try {
			const json = localStorage.getItem(KEY_LOCAL_STORAGE)
			if (!json) this._user = null
			else this._user = JSON.parse(json)
		} catch (e) {
			console.error('Unable to parse user json in local storage', e)
			this._user = null
		}
	}

	storeUser = (user: User | null) => {
		if (user) localStorage.setItem(KEY_LOCAL_STORAGE, JSON.stringify(user))
		else localStorage.removeItem(KEY_LOCAL_STORAGE)
		this._user = user
	}

	setUser = (user: User | null) => {
		this._user = user
	}

	getUser = () => this._user
}

const userStore = new UserStore()

const onChangeListeners: Array<(user: User | null) => void> = []

sysend.on(KEY_BROADCAST_AUTH, (user: User | null) => {
	console.log('Receiving user change', user)
	userStore.setUser(user)

	onChangeListeners.forEach((callback) => {
		callback(user)
	})
})

function onUserChange(newUser: User | null) {
	sysend.broadcast(KEY_BROADCAST_AUTH, newUser)
	onChangeListeners.forEach((callback) => {
		callback(newUser)
	})
}

/**
 * Sets the new user.
 * @param user new user
 */
export function setUser(user: User) {
	userStore.storeUser(user)
	onUserChange(user)
}

export function parseTokenAndSetUser(accessToken: string) {
	const userInfo = jwt.decode(accessToken) as UserInfo
	const user = {accessToken, userInfo}

	setUser(user)
}

/**
 * Will clean user from local storage. Will not perform any api call!
 */
export function cleanUser() {
	userStore.storeUser(null)
	onUserChange(null)
}

/**
 * Gets the current user. Prefer using the useUser hook when possible
 */
export function getUser(): User | null {
	return userStore.getUser()
}

/**
 * @param listener wil be called when user changes
 * @returns disposer - call this method to stop listening
 */
export function listenForUserChange(
	listener: (user: User | null) => void
): () => void {
	onChangeListeners.push(listener)

	return () => {
		onChangeListeners.filter((one) => one !== listener)
	}
}

/**
 * Hook for getting current user
 */
export function useUser(): User | null {
	const [watchedUser, setWatchedUser] = useState(getUser())

	useEffect(() => {
		return listenForUserChange(setWatchedUser)
	}, [])

	return watchedUser
}

export function useLogout(): () => void {
	return useCallback(() => {
		cleanUser()
		// TODO use gapi from context
		// @ts-ignore
		window.gapi.auth2.getAuthInstance().signOut()
	}, [])
}
