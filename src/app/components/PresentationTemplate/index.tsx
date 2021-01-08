import React from 'react'
import {createStyles, makeStyles} from '@material-ui/core'
import TopBar from './components/TopBar'
import Footer from './components/Footer'

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {
			display: 'flex',
			flexDirection: 'column',
			minHeight: '100vh',
		},
		topBar: {},
		content: {
			margin: theme.spacing(10, 0),
			flex: '1',
		},
		footer: {},
	})
)

interface Props {
	children: React.ReactNode
}

function PresentationTemplate({children}: Props) {
	const classes = useStyles()
	return (
		<div className={classes.root}>
			<TopBar className={classes.topBar} />
			<div className={classes.content}>{children}</div>
			<Footer className={classes.footer} />
		</div>
	)
}

PresentationTemplate.defaultProps = {
	noPadding: false,
}

export default PresentationTemplate
