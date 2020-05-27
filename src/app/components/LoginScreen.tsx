import React, {useState} from 'react'
import {Container, Typography, Button} from '@material-ui/core'
import {createStyles, makeStyles} from '@material-ui/core/styles'
import {useAsync} from 'react-async'
import GoogleLogin, {
	GoogleLoginResponseOffline,
	useGoogleLogout,
} from 'react-google-login'
import apiService from '../api'
import {setUser} from '../utils/auth'

const CLIENT_ID = String(process.env.REACT_APP_GOOGLE_CLIENT_ID)
if (!CLIENT_ID) {
	throw new Error('Make sure to define TRACT_API_GOOGLE_CLIENT_ID')
}

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

function loginPromise([{username, password}]: [
	{username: string; password: string}
]) {
	return apiService.auth.login({username, password})
}

export default function LoginPage() {
	const classes = useStyles({})
	const [code, setCode] = useState('')
	const loginTask = useAsync({
		deferFn: loginPromise,
		onResolve: (response) => {
			setUser(response.data)
		},
	})

	const {signOut} = useGoogleLogout({
		onLogoutSuccess: () => {
			setCode('')
		},
	})

	return (
		<Container component="main" maxWidth="xs" className={classes.root}>
			<div className={classes.paper}>
				<Typography className={classes.label} variant="h4" align="center">
					Web na generování smluv
				</Typography>
				<GoogleLogin
					clientId={CLIENT_ID}
					onSuccess={(response: GoogleLoginResponseOffline) => {
						console.log(response)
						setCode(response.code)
					}}
					onFailure={console.error}
					scope={[
						'https://www.googleapis.com/auth/drive.file',
						'https://www.googleapis.com/auth/documents',
						'https://www.googleapis.com/auth/spreadsheets.readonly',
					].join(' ')}
					responseType="code"
					accessType="offline"
				/>
				<Typography>code: {code}</Typography>
				<Button onClick={signOut}>signOut</Button>
			</div>
		</Container>
	)
}
