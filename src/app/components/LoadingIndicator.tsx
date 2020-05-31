import React from 'react'
import {CircularProgress, Typography} from '@material-ui/core'
import {createStyles, makeStyles} from '@material-ui/core/styles'

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {
			padding: theme.spacing(4),
			minWidth: '20rem',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			flexDirection: 'column',
		},
		text: {
			marginTop: theme.spacing(2),
		},
	})
)

function LoadingIndicator({text}: {text: string}) {
	const classes = useStyles({})

	return (
		<div className={classes.root}>
			<CircularProgress />
			<Typography className={classes.text}>{text}</Typography>
		</div>
	)
}

LoadingIndicator.defaultProps = {
	text: 'Loading',
}

export default LoadingIndicator
