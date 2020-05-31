import React from 'react'
import {Typography, Button} from '@material-ui/core'
import copy from 'copy-to-clipboard'
import {useUser} from '../utils/auth'

interface Props {
	className?: string
}

function DevScreen({className}: Props) {
	const user = useUser()
	if (!user) return null
	return (
		<div className={className}>
			userToken:
			<Typography>{user.accessToken}</Typography>
			<Button onClick={() => copy(user.accessToken)}>Copy</Button>
		</div>
	)
}

export default DevScreen
