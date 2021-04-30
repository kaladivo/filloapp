import React from 'react'
import {Route, Switch} from 'react-router-dom'
import {Section} from '../../../insideSections'
import {useSyncSentryUser} from '../../../utils/sentry'

interface Props {
	sections: Section[]
}

function InsideRouter({sections}: Props) {
	useSyncSentryUser()

	return (
		<Switch>
			{sections.map((section) => (
				<Route
					key={section.paths.join()}
					path={section.paths}
					exact={section.exact}
				>
					<section.Component />
				</Route>
			))}
		</Switch>
	)
}

export default InsideRouter
