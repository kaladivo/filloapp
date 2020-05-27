import React, {useState, useCallback, useEffect} from 'react'
import {Container, Typography, Button} from '@material-ui/core'
import {createStyles, makeStyles} from '@material-ui/core/styles'
import {useAsync} from 'react-async'
import GoogleLogin, {
	GoogleLoginResponseOffline,
	useGoogleLogout,
} from 'react-google-login'
import copy from 'copy-to-clipboard'
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

function loginPromise([{code}]: [{code: string}]) {
	return apiService.auth.login({code})
}

export default function LoginPage() {
	const classes = useStyles({})
	const [code, setCode] = useState('')
	const loginTask = useAsync({
		deferFn: loginPromise,
		onResolve: (response) => {
			setCode(response.data.bearer)
		},
	})

	useEffect(() => {
		window.gapi.load('picker')
	}, [])

	const {signOut} = useGoogleLogout({
		clientId: CLIENT_ID,
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
						loginTask.run({code: response.code})
					}}
					onFailure={console.error}
					scope={[
						'https://www.googleapis.com/auth/drive',
						'https://www.googleapis.com/auth/documents',
						'https://www.googleapis.com/auth/spreadsheets.readonly',
					].join(' ')}
					responseType="code"
					accessType="offline"
				/>
				<Typography>code: {code}</Typography>
				<Button onClick={() => copy(code)}>copy</Button>
				<Button onClick={signOut}>signOut</Button>
				<Button
					onClick={() => {
						const picker = new window.google.picker.PickerBuilder()
							.addView(window.google.picker.ViewId.DOCS)
							.setOAuthToken(
								'ya29.a0AfH6SMDcypAkPExd9U5DKpG6LxwgXfFQhrMX6vz_n27Uh8I8c2RmHWCsv8bVTy8INF7V9qKL68NAWn5VF2tKpy0ntmPscaRjy94sMkFtdpit4nOIlwfJIRX_F2OO2EzmTsZYV48qu2aOc-wL_SPR0wMyMxcFSOjCEQAE'
							)
							.setDeveloperKey('AIzaSyBwCChT6STAZGSSrvdAq_Jv73XDPjEfuyI')
							.setCallback((...a) => console.log(a))
							.build()
						picker.setVisible(true)
					}}
				>
					picker
				</Button>

				<br />
				<br />
				<br />
			</div>
		</Container>
	)
}

// @ts-ignore
window.showPicker = async function (token) {
	await window.gapi.load('picker')
	const picker = new window.google.picker.PickerBuilder()
		.addView(window.google.picker.ViewId.DOCS)
		.setOAuthToken(token)
		.setDeveloperKey('AIzaSyBwCChT6STAZGSSrvdAq_Jv73XDPjEfuyI')
		.setCallback((...a) => console.log(a))
		.build()
	picker.setVisible(true)
}
