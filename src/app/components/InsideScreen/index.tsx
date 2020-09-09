import React, {useState} from 'react'
import {makeStyles, createStyles} from '@material-ui/core'
import TopBar from './components/TopBar'
import NavigationDrawer from './components/NavigationDrawer'
import NavigationList from './components/NavigationList'
import useSections from '../../sections'
import InsideRouter from './components/InsideRouter'
import CustomerInfoProvider from '../CustomerInfoProvider'
import {WaitForEnvInfo} from '../EnvInfoProvider'

const drawerWidth = 300

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {
			display: 'flex',
			flexGrow: 1,
		},
		content: {
			flexGrow: 1,
			display: 'flex',
			flexDirection: 'column',
		},
		toolbar: theme.mixins.toolbar,
		pageContent: {
			flexGrow: 1,
			display: 'flex',
			flexDirection: 'column',
		},
		playerBar: {
			[theme.breakpoints.up('md')]: {
				left: drawerWidth,
			},
		},
	})
)

function InsideScreen() {
	const classes = useStyles()
	const [drawerOpen, setDrawerOpen] = useState(false)
	const sections = useSections()
	return (
		<CustomerInfoProvider>
			<WaitForEnvInfo>
				<div className={classes.root}>
					<TopBar
						drawerWidth={drawerWidth}
						onMenuButtonClicked={() => setDrawerOpen((value) => !value)}
					/>
					<NavigationDrawer
						mobileOpen={drawerOpen}
						onToggleOpen={() => setDrawerOpen((value) => !value)}
						drawerWidth={drawerWidth}
					>
						<NavigationList sections={sections} />
					</NavigationDrawer>
					<main className={classes.content}>
						<div className={classes.toolbar} />
						<div className={classes.pageContent}>
							<InsideRouter sections={sections} />
						</div>
					</main>
				</div>
			</WaitForEnvInfo>
		</CustomerInfoProvider>
	)
}

export default InsideScreen
