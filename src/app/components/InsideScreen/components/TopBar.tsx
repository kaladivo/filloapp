import React from 'react'
import {
	AppBar,
	Toolbar,
	Typography,
	makeStyles,
	createStyles,
	Theme,
	IconButton,
	Button,
} from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'
import {useTranslation} from 'react-i18next'
import {useLogout} from '../../../utils/auth'

const logo = require('../../../images/logo.png')

const useStyles = makeStyles<Theme, {drawerWidth: string | number}>((theme) =>
	createStyles({
		appBar: (props) => ({
			[theme.breakpoints.up('md')]: {
				width: `calc(100% - ${props.drawerWidth}px)`,
			},
		}),
		menuButton: {
			marginRight: theme.spacing(2),
			[theme.breakpoints.up('md')]: {
				display: 'none',
			},
		},
		logoText: {
			color: 'inherit',
			textDecoration: 'none',
		},
		logoImg: {
			width: theme.spacing(4),
			height: 'auto',
			marginRight: theme.spacing(1),
		},
		logo: {
			flexGrow: 1,
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
		},
	})
)

interface Props {
	drawerWidth: string | number
	onMenuButtonClicked: () => void
}

function TopBar({drawerWidth, onMenuButtonClicked}: Props) {
	const classes = useStyles({drawerWidth})
	const logout = useLogout()
	const {t} = useTranslation()
	return (
		<AppBar className={classes.appBar} position="fixed">
			<Toolbar>
				<IconButton
					color="inherit"
					aria-label="Open drawer"
					edge="start"
					onClick={onMenuButtonClicked}
					className={classes.menuButton}
				>
					<MenuIcon />
				</IconButton>
				<div className={classes.logo}>
					<img src={logo} className={classes.logoImg} alt="" />
					<Typography className={classes.logoText} variant="h6" noWrap>
						{t('appName')}
					</Typography>
				</div>
				<Button onClick={logout} color="inherit">
					{t('TopBar.logout')}
				</Button>
			</Toolbar>
		</AppBar>
	)
}

export default TopBar
