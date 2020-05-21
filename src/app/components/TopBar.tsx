import React from 'react'
import {
	Toolbar,
	Typography,
	AppBar,
	Button,
	makeStyles,
	createStyles,
} from '@material-ui/core'
import {cleanUser} from '../utils/auth'

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {
			flexGrow: 1,
		},
		menuButton: {
			marginRight: theme.spacing(2),
		},
		title: {
			flexGrow: 1,
		},
	})
)

function TopBar() {
	const classes = useStyles()
	return (
		<div className={classes.root}>
			<AppBar position="static">
				<Toolbar>
					<Typography className={classes.title} variant="h6">
						Web na generování smluv
					</Typography>
					<Button color="inherit" onClick={cleanUser}>
						Odhlásit se
					</Button>
				</Toolbar>
			</AppBar>
		</div>
	)
}

export default TopBar
