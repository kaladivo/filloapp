import * as Sentry from '@sentry/react'
import {Integrations} from '@sentry/tracing'
import {EnvInfo} from '../../constants/models/EnvInfo'
import User from '../../constants/User'
import {useUser} from '../components/AuthProvider'

const sentryConfig = {
	dsn: process.env.REACT_APP_SENTRY_DSN,
	tracesSampleRate: Number(
		process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE || 0
	),
	release: process.env.REACT_APP_VERSION || 'unknown',
	integrations: [new Integrations.BrowserTracing()],
}

Sentry.init(sentryConfig)
console.info('Sentry init done', sentryConfig)

export function configureFromEnvInfo(envInfo: EnvInfo) {
	Sentry.configureScope((scope) => {
		scope.addEventProcessor((event) => {
			event.environment = envInfo.environment
			return event
		})
	})
}

export function setSentryUser(user: User | null) {
	Sentry.configureScope((scope) => {
		if (user) {
			scope.setUser({
				id: user.email,
				selectedCustomer: user.selectedCustomer?.customerId || null,
			})
		} else {
			scope.setUser(null)
		}
	})
}

export function useSyncSentryUser() {
	const user = useUser()
	setSentryUser(user?.userInfo || null)
}

const sentry = Sentry
export default sentry
