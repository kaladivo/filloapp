import React from 'react'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import {Link} from 'react-router-dom'
import {
	Typography,
	Link as MuiLink,
	makeStyles,
	createStyles,
} from '@material-ui/core'

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {
			display: 'flex',
			margin: theme.spacing(1, 0, 2),
		},
		arrow: {
			marginRight: theme.spacing(1),
		},
	})
)

interface Props {
	className?: string
	to: string
	text: string
}

function BackBreadcrumb({className, to, text}: Props) {
	const classes = useStyles()
	return (
		<MuiLink
			className={`${className} ${classes.root}`}
			component={Link}
			to={to}
		>
			<ArrowBackIcon className={classes.arrow} fontSize="small" />
			<Typography>{text}</Typography>
		</MuiLink>
	)
}

export default BackBreadcrumb
