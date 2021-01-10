import React from 'react'
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'
import AuthSensitiveRoute from './AuthSensitiveRoute'
import LoginScreen from './LoginScreen'
import InsideScreen from './InsideScreen'
import Presentation from './Presentation'
import PrivacyPolicy from './PrivacyPolicy'
import TermsOfService from './TermsOfService'

function RootRouter() {
	return (
		<Router>
			<Switch>
				<Route path="/presentation">
					<Presentation />
				</Route>
				<Route path="/terms-of-service">
					<TermsOfService />
				</Route>
				<Route path="/privacy-policy">
					<PrivacyPolicy />
				</Route>
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
