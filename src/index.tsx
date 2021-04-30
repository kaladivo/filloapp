import './app/utils/sentry'

import React from 'react'
import ReactDOM from 'react-dom'
// import * as Sentry from '@sentry/react'
// import {Integrations} from '@sentry/tracing'
import App from './app'

// Sentry.init({
// 	dsn:
// 		'https://df48ee60d49e4570b44ac8a2fe91ef26@o521957.ingest.sentry.io/5632686',
// 	integrations: [new Integrations.BrowserTracing()],
//
// 	// Set tracesSampleRate to 1.0 to capture 100%
// 	// of transactions for performance monitoring.
// 	// We recommend adjusting this value in production
// 	tracesSampleRate: 1.0,
// })

ReactDOM.render(<App />, document.getElementById('root'))
