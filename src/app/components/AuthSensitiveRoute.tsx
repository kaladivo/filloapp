import React, {useState, useEffect} from 'react'
import {Route, Redirect, RouteProps} from 'react-router-dom'
import {listenForUserChange, getUser} from '../utils/auth'

interface Props extends RouteProps {
	mode: 'onlyLogged' | 'onlyNotLogged'
	path: string
	children: React.ReactNode
}

function AuthSensitiveRoute({mode, path, children}: Props) {
	const [isLoggedIn, setIsLoggedIn] = useState(!!getUser())

	useEffect(() => {
		return listenForUserChange((user) => {
			setIsLoggedIn(!!user)
		})
	}, [])

	return (
		<>
			<Route
				render={() => {
					if (mode === 'onlyLogged') {
						if (isLoggedIn) return children
						return <Redirect to="/presentation" />
					}

					if (mode === 'onlyNotLogged') {
						if (!isLoggedIn) return children
						return <Redirect to="/" />
					}

					return children
				}}
				path={path}
			/>
		</>
	)
}

export default AuthSensitiveRoute
