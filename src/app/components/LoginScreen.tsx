import React, {useCallback} from 'react'
import {Container, Typography} from '@material-ui/core'
import {createStyles, makeStyles} from '@material-ui/core/styles'
import {useAsync} from 'react-async'
import GoogleLogin, {
	GoogleLoginResponseOffline,
	useGoogleLogout,
} from 'react-google-login'
import jwt from 'jsonwebtoken'
import {useTranslation} from 'react-i18next'
import {useSnackbar} from 'notistack'
import {useApiService} from '../api/apiContext'
import {ApiService} from '../api'
import {setUser} from '../utils/auth'
import User from '../../constants/User'
import errorCodes from '../../constants/errorCodes'

const CLIENT_ID = String(process.env.REACT_APP_GOOGLE_CLIENT_ID)
const SCOPES = String(process.env.REACT_APP_GOOGLE_SCOPES)

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {},
		label: {
			margin: theme.spacing(1),
		},
		paper: {
			marginTop: theme.spacing(8),
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
		},
	})
)

async function loginPromise([{apiService, code}]: [
	{apiService: ApiService; code: string}
]) {
	const result = await apiService.auth.login({code})

	const accessToken = result.data.bearer
	const userInfo: User = jwt.decode(accessToken) as User
	const user = {accessToken, userInfo}

	setUser(user)

	return null
}

export default function LoginPage() {
	const {t} = useTranslation()
	const apiService = useApiService()
	const classes = useStyles({})
	const {enqueueSnackbar} = useSnackbar()
	const {signOut} = useGoogleLogout({clientId: CLIENT_ID})

	const setLoginError = useCallback(
		(error) => {
			const errorCode = error.response?.data?.errorCode
			if (errorCode === errorCodes.NO_CUSTOMER_FOR_EMAIL) {
				enqueueSnackbar(t('LoginScreen.badDomain'), {variant: 'error'})
			} else {
				enqueueSnackbar(t('LoginScreen.canNotSignIn'), {variant: 'error'})
			}
		},
		[enqueueSnackbar]
	)

	const loginTask = useAsync({
		deferFn: loginPromise,
		onReject: setLoginError,
	})

	return (
		<Container component="main" maxWidth="xs" className={classes.root}>
			<div className={classes.paper}>
				<Typography className={classes.label} variant="h4" align="center">
					{t('appName')}
				</Typography>
				<GoogleLogin
					onRequest={signOut}
					clientId={CLIENT_ID}
					onSuccess={(response: GoogleLoginResponseOffline) => {
						loginTask.run({apiService, code: response.code})
					}}
					onFailure={setLoginError}
					scope={SCOPES}
					responseType="code"
					accessType="offline"
					buttonText={t('LoginScreen.loginWithGoogle')}
				/>
			</div>
		</Container>
	)
}
