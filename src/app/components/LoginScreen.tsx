import React, {useState} from 'react'
import {
	Container,
	TextField,
	Button,
	Typography,
	CircularProgress,
} from '@material-ui/core'
import {createStyles, makeStyles} from '@material-ui/core/styles'
import {useAsync} from 'react-async'
import apiService from '../api'
import {setUser} from '../utils/auth'

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {},
		avatar: {
			margin: theme.spacing(1),
			height: '5rem',
		},
		label: {
			margin: theme.spacing(1),
		},
		paper: {
			marginTop: theme.spacing(8),
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
		},
		form: {
			width: '100%', // Fix IE 11 issue.
			marginTop: theme.spacing(1),
		},
		submit: {
			margin: theme.spacing(3, 0, 2),
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
	const loginTask = useAsync({
		deferFn: loginPromise,
		onResolve: (response) => {
			setUser(response.data)
		},
	})

	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')

	function handleSubmit(e) {
		e.preventDefault()
		loginTask.run({username, password})
	}

	return (
		<Container component="main" maxWidth="xs" className={classes.root}>
			<div className={classes.paper}>
				<Typography className={classes.label} variant="h4" align="center">
					Web na generování smluv
				</Typography>
				<form onSubmit={handleSubmit} className={classes.form} noValidate>
					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						id="email"
						label="Uživatelské jméno"
						name="email"
						autoFocus
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						name="password"
						label="Heslo"
						type="password"
						id="password"
						autoComplete="current-password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					{loginTask.isRejected && (
						<Typography color="error">
							Uživatele nelze přihlásit. Zadejte správné jméno a heslo.{' '}
							{loginTask.error.message}
						</Typography>
					)}
					<Button
						type="submit"
						fullWidth
						variant="contained"
						color="primary"
						className={classes.submit}
						disabled={loginTask.isLoading}
					>
						Přihlásit se{loginTask.isLoading && <CircularProgress />}
					</Button>
				</form>
			</div>
		</Container>
	)
}
