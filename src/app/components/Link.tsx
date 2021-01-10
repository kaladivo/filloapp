import React from 'react'
import {Link as RouterLink} from 'react-router-dom'
import {Link as MuiLink} from '@material-ui/core'

interface Props {
	to: string
	children: React.ReactNode
	className?: string
	onClick?: () => void
}

function Link({to, children, className, onClick}: Props) {
	return (
		<MuiLink
			className={className}
			to={to}
			onClick={onClick}
			component={RouterLink}
		>
			{children}
		</MuiLink>
	)
}

export default Link
