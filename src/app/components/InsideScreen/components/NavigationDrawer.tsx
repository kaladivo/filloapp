import React from 'react'
import {
	Drawer,
	makeStyles,
	createStyles,
	Theme,
	Hidden,
} from '@material-ui/core'

const useStyles = makeStyles<Theme, {drawerWidth: string | number}>((theme) =>
	createStyles({
		drawer: (props) => ({
			[theme.breakpoints.up('md')]: {
				width: props.drawerWidth,
				flexShrink: 0,
			},
		}),
		drawerPaper: (props) => ({
			width: props.drawerWidth,
		}),
	})
)

interface Props {
	drawerWidth: string | number
	mobileOpen: boolean
	onToggleOpen: () => void
	children: React.ReactNode
}

function NavigationDrawer({
	drawerWidth,
	mobileOpen,
	onToggleOpen,
	children,
}: Props) {
	const classes = useStyles({drawerWidth})
	return (
		<nav className={classes.drawer}>
			<Hidden mdUp implementation="css">
				<Drawer
					open={mobileOpen}
					onClose={onToggleOpen}
					classes={{paper: classes.drawerPaper}}
					variant="temporary"
					ModalProps={{keepMounted: true}}
				>
					{children}
				</Drawer>
			</Hidden>
			<Hidden smDown implementation="css">
				<Drawer classes={{paper: classes.drawerPaper}} open variant="permanent">
					{children}
				</Drawer>
			</Hidden>
		</nav>
	)
}

export default NavigationDrawer
