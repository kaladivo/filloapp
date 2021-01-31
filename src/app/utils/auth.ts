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

const onChangeListeners: Array<(user: User | null) => void> = []

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
	console.log('setting user', user)
	localStorage.setItem(KEY_LOCAL_STORAGE, JSON.stringify(user))
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
	localStorage.removeItem(KEY_LOCAL_STORAGE)
	onUserChange(null)
}

/**
 * Gets the current user. Prefer using the useUser hook when possible
 */
export function getUser(): User | null {
	try {
		const jsonString = localStorage.getItem(KEY_LOCAL_STORAGE)
		if (!jsonString) return null
		return JSON.parse(jsonString)
	} catch (e) {
		console.info('Unable to parse user. Logging out.', e)
		localStorage.removeItem(KEY_LOCAL_STORAGE)
		return null
	}
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

sysend.on(KEY_BROADCAST_AUTH, (user: User | null) => {
	if (user) localStorage.setItem(KEY_LOCAL_STORAGE, JSON.stringify(user))
	else localStorage.removeItem(KEY_LOCAL_STORAGE)

	onChangeListeners.forEach((callback) => {
		callback(user)
	})
})

/**
 * Hook for getting current user
 */
export function useUser(): User | null {
	const [currentUser, setCurrentUser] = useState(getUser())

	useEffect(() => {
		return listenForUserChange(setCurrentUser)
	}, [])

	return currentUser
}

export function useLogout(): () => void {
	return useCallback(() => {
		cleanUser()
		// TODO use gapi from context
		// @ts-ignore
		window.gapi.auth2.getAuthInstance().signOut()
	}, [])
}
