import React from 'react'
import {Typography, Button, makeStyles, createStyles} from '@material-ui/core'
import {useTranslation} from 'react-i18next'

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {
			'& > *': {
				margin: theme.spacing(2, 0, 0),
			},
		},
		buttons: {
			display: 'flex',
			margin: theme.spacing(2, -1, 0),
			'& > *': {
				margin: theme.spacing(0, 1),
			},
		},
	})
)

interface Props {
	className?: string
	onRetry: () => void
	onGoBack: () => void
}

function ErrorScreen({className, onGoBack, onRetry}: Props) {
	const classes = useStyles()
	const {t} = useTranslation()
	return (
		<div className={`${className} ${classes.root}`}>
			<Typography>{t('SubmitBlueprintsGroupScreen.error')}</Typography>
			<div className={classes.buttons}>
				<Button variant="contained" color="primary" onClick={onRetry}>
					{t('common.retry')}
				</Button>
				<Button variant="outlined" color="primary" onClick={onGoBack}>
					{t('SubmitBlueprintsGroupScreen.editValuesAndSettings')}
				</Button>
			</div>
		</div>
	)
}

export default ErrorScreen
