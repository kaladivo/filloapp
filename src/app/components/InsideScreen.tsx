import React from 'react'
import {createStyles, makeStyles, Container} from '@material-ui/core'
import AuthChecker from './AuthChecker'
import AgreementsForm from './AgreementsForm'
import TopBar from './TopBar'

const useStyles = makeStyles((theme) =>
	createStyles({
		content: {
			padding: theme.spacing(3, 0, 5),
		},
	})
)

function InsideScreen() {
	const classes = useStyles()
	return (
		<div>
			<TopBar />
			<Container className={classes.content}>
				<AuthChecker />
				<AgreementsForm />
			</Container>
		</div>
	)
}

export default InsideScreen
