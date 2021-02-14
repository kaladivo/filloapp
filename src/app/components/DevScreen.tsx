import React from 'react'
import {Typography, Button} from '@material-ui/core'
import copy from 'copy-to-clipboard'
import ReactJson from 'react-json-view'
import {useCustomerInfo} from './CustomerInfoProvider'
import {useUser} from './AuthProvider'

interface Props {
	className?: string
}

function DevScreen({className}: Props) {
	const user = useUser()
	const customerInfo = useCustomerInfo()
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
		</div>
	)
}

export default DevScreen
