import React from 'react'
import {Typography, Button} from '@material-ui/core'
import copy from 'copy-to-clipboard'
import ReactJson from 'react-json-view'
import {useCustomerInfo} from './CustomerInfoProvider'
import {useUser} from './AuthProvider'
import sentry from '../utils/sentry'
import {useApiService} from '../api/apiContext'

interface Props {
	className?: string
}

function DevScreen({className}: Props) {
	const user = useUser()
	const customerInfo = useCustomerInfo()
	const api = useApiService()

	if (!user) return null

	return (
		<div className={className}>
			userToken:
			<Typography>{user.accessToken}</Typography>
			<Button onClick={() => copy(user.accessToken)}>Copy</Button>
			<br />
			user:
			<ReactJson src={user} />
			<br />
			customerInfo:
			<ReactJson src={customerInfo} />
			<br />
			<Button
				onClick={() => {
					console.info('Capturing event')
					sentry.captureEvent({
						message:
							'This is a test event to ensure the sentry integration works correctly',
					})

					sentry.captureException(new Error('Test exception for sentry'))
					sentry.captureMessage('test message')

					api.testSentry()

					// @ts-ignore
					// eslint-disable-next-line no-undef
					functionThatDoesNotExistForSentry()
				}}
				color="primary"
				variant="contained"
			>
				Test sentry
			</Button>
		</div>
	)
}

export default DevScreen
