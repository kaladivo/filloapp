import React, {useCallback, useMemo} from 'react'
import {Container, Typography} from '@material-ui/core'
import {createStyles, makeStyles} from '@material-ui/core/styles'
import {useAsync} from 'react-async'
// import GoogleLogin, {
// 	GoogleLoginResponseOffline,
// 	useGoogleLogout,
// } from 'react-google-login'
import jwt from 'jsonwebtoken'
import {useTranslation} from 'react-i18next'
import {useSnackbar} from 'notistack'
import GoogleButton from 'react-google-button'
import {useApiService} from '../api/apiContext'
import {ApiService} from '../api'
import {setUser} from '../utils/auth'
import User from '../../constants/User'
import errorCodes from '../../constants/errorCodes'
import {WaitForEnvInfo} from './EnvInfoProvider'

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

async function loginPromise([{apiService, googleAccessToken}]: [
	{apiService: ApiService; googleAccessToken: string}
]) {
	const result = await apiService.auth.loginWithAccessToken({googleAccessToken})

	const accessToken = result.data.bearer
	const userInfo: User = jwt.decode(accessToken) as User
	const user = {accessToken, userInfo}

	setUser(user)

	return null
}

function LoginPage() {
	const {t} = useTranslation()
	const apiService = useApiService()
	const classes = useStyles({})
	const {enqueueSnackbar} = useSnackbar()
	// const {signOut} = useGoogleLogout({clientId: CLIENT_ID})
	// TODO use provider context instead of getting gapi from window
	// @ts-ignore
	const gapi = useMemo(() => window.gapi, [])

	const setLoginError = useCallback(
		(error) => {
			const errorCode = error.response?.data?.errorCode
			if (errorCode === errorCodes.NO_CUSTOMER_FOR_EMAIL) {
				enqueueSnackbar(t('LoginScreen.badDomain'), {variant: 'error'})
			} else {
				enqueueSnackbar(t('LoginScreen.canNotSignIn'), {variant: 'error'})
			}
		},
		[enqueueSnackbar, t]
	)

	// useEffect(() => {
	// 	gapi.
	// }, [])

	// @ts-ignore
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
				<GoogleButton
					onClick={async () => {
						const authInstance = gapi.auth2.getAuthInstance()
						const user = await authInstance.signIn()
						const {access_token: googleAccessToken} = user.getAuthResponse()

						// TODO check scopes

						loginTask.run({apiService, googleAccessToken})
					}}
				>
					{t('LoginScreen.loginWithGoogle')}
				</GoogleButton>
				{/* <GoogleLogin
					// onRequest={signOut}
					cookiePolicy="none"
					clientId={CLIENT_ID}
					onAutoLoadFinished={(aha) => console.log('autoload', aha)}
					onSuccess={(response: GoogleLoginResponseOffline) => {
						console.log('hey beautiful', response)
						loginTask.run({apiService, code: response.code})
					}}
					onFailure={setLoginError}
					scope={SCOPES}
					redirectUri="http://localhost:3000/login/redirect"
					uxMode="redirect"
					// responseType="code"
					// accessType="online"
					buttonText={t('LoginScreen.loginWithGoogle')}
				/> */}
			</div>
		</Container>
	)
}

export default function LoginPageWithEnvInfo() {
	return (
		<WaitForEnvInfo>
			<LoginPage />
		</WaitForEnvInfo>
	)
}
