import * as Sentry from '@sentry/react'
import {Integrations} from '@sentry/tracing'
import {BrowserOptions} from '@sentry/react'
import {EnvInfo} from '../../constants/models/EnvInfo'
import User from '../../constants/User'
import {useUser} from '../components/AuthProvider'

export const sentryTraceId = Math.random().toString(36).substr(2, 9)

const sentryConfig: BrowserOptions = {
	dsn: process.env.REACT_APP_SENTRY_DSN,
	tracesSampleRate: Number(
		process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE || 0
	),
	release: process.env.REACT_APP_VERSION || 'unknown',
	integrations: [new Integrations.BrowserTracing()],
}

Sentry.init(sentryConfig)
Sentry.getCurrentHub().setTag('traceId', sentryTraceId)
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
			scope.setUser(user)
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
