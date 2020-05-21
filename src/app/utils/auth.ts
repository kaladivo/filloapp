import {useState, useEffect} from 'react'
import sysend from 'sysend'

export interface User {
	username: string
	accessToken: string
}

const KEY_BROADCAST_AUTH = 'AUTH_BROADCAST'
const KEY_LOCAL_STORAGE = 'AUTH_LOCAL_STORAGE'

const onChangeListeners: Array<(user: User | null) => void> = []

function onUserChange(newUser: User | null) {
	sysend.broadcast(KEY_BROADCAST_AUTH, newUser)
	onChangeListeners.forEach((callback) => {
		callback(newUser)
	})
}

export function setUser(user: User) {
	console.log('setting user', user)
	localStorage.setItem(KEY_LOCAL_STORAGE, JSON.stringify(user))
	onUserChange(user)
}

export function cleanUser() {
	localStorage.removeItem(KEY_LOCAL_STORAGE)
	onUserChange(null)
}

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
 * @returns disposer
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

export function useUser() {
	const [currentUser, setCurrentUser] = useState(getUser())

	useEffect(() => {
		return listenForUserChange(setCurrentUser)
	}, [])

	return currentUser
}
