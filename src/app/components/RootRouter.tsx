import React from 'react'
import {BrowserRouter as Router, Switch} from 'react-router-dom'
import AuthSensitiveRoute from './AuthSensitiveRoute'
import LoginScreen from './LoginScreen'
import InsideScreen from './InsideScreen'

function RootRouter() {
	return (
		<Router>
			<Switch>
				<AuthSensitiveRoute mode="onlyNotLogged" path="/login">
					<LoginScreen />
				</AuthSensitiveRoute>
				<AuthSensitiveRoute mode="onlyLogged" path="/">
					<InsideScreen />
				</AuthSensitiveRoute>
			</Switch>
		</Router>
	)
}

export default RootRouter
