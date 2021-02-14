import React from 'react'
import {Route, Redirect, RouteProps} from 'react-router-dom'
import {useIsLoggedIn} from './AuthProvider'

interface Props extends RouteProps {
	mode: 'onlyLogged' | 'onlyNotLogged'
	path: string
	children: React.ReactNode
}

function AuthSensitiveRoute({mode, path, children}: Props) {
	const isLoggedIn = useIsLoggedIn()

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
