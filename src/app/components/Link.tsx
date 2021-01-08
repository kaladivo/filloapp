import React from 'react'
import {Link as RouterLink} from 'react-router-dom'
import {Link as MuiLink} from '@material-ui/core'

interface Props {
	to: string
	children: React.ReactNode
	className?: string
}

function Link({to, children, className}: Props) {
	return (
		<MuiLink className={className} to={to} component={RouterLink}>
			{children}
		</MuiLink>
	)
}

export default Link
