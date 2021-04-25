import React from 'react'
import {
	Typography,
	Button,
	makeStyles,
	createStyles,
	Link,
} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {UNABLE_TO_ACQUIRE_WRITE_ACCESS_FOR_SERVICE_ACCOUNT} from '../../../../constants/errorCodes'
import {useEnvInfo} from '../../EnvInfoProvider'

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
	error: any
}

function ErrorScreen({className, onGoBack, onRetry, error}: Props) {
	const classes = useStyles()
	const {t} = useTranslation()
	const info = useEnvInfo()

	const filesWithoutPermissions = error.response?.data.filesWithoutPermissions
	const accessError =
		error.response?.data?.errorCode ===
		UNABLE_TO_ACQUIRE_WRITE_ACCESS_FOR_SERVICE_ACCOUNT

	return (
		<div className={`${className} ${classes.root}`}>
			<Typography>{t('SubmitBlueprintsGroupScreen.error')}</Typography>
			{accessError && (
				<Typography>
					{t('errors.unable_to_acquire_write_access_for_service_account')}
					<br />
					<b>{info.googleSharingServiceAccount}</b>
				</Typography>
			)}
			{filesWithoutPermissions && (
				<>
					<Typography>{t('SubmitBlueprintsGroupScreen.noAccess')}</Typography>
					{filesWithoutPermissions.map(({url}: any, i: number) => (
						<Typography>
							<Link href={url} target="_blank">
								{t('SubmitBlueprintsGroupScreen.requireAccess', {
									number: i + 1,
								})}
							</Link>
						</Typography>
					))}
				</>
			)}
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
