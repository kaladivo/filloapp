import React from 'react'
import {
	AppBar,
	Button,
	createStyles,
	Hidden,
	makeStyles,
	Toolbar,
	Typography,
} from '@material-ui/core'
import {Link} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {useUser} from '../../../utils/auth'

const logo = require('../../../images/logo.png')

const useStyles = makeStyles((theme) =>
	createStyles({
		menuItems: {
			margin: theme.spacing(0, 2),
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
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
		},
		filler: {
			flex: 1,
		},
	})
)

function useNavigationItems(): Array<{name: string; href: string}> {
	// const {t} = useTranslation()

	return [
		// {
		// 	name: t('Presentation.menu.about'),
		// 	href: '/presentation#about',
		// },
		// {
		// 	name: t('Presentation.menu.faq'),
		// 	href: 'ble',
		// },
		// {
		// 	name: t('Presentation.menu.getStarted'),
		// 	href: 'ble',
		// },
	]
}

function TopBar({className}: {className?: string}) {
	const {t} = useTranslation()
	const classes = useStyles()
	const navigationItems = useNavigationItems()
	const user = useUser()

	return (
		<AppBar className={className} position="fixed">
			<Toolbar>
				<div className={classes.logo}>
					<img className={classes.logoImg} src={logo} alt="" />
					<Typography
						className={classes.logoText}
						component={Link}
						to="/presentation"
						variant="h6"
						noWrap
					>
						{t('appName')}
					</Typography>
				</div>
				<Hidden xsDown>
					<div className={classes.menuItems}>
						{navigationItems.map((one) => (
							<Button
								key={one.name}
								component={Link}
								color="inherit"
								to={one.href}
							>
								{one.name}
							</Button>
						))}
					</div>
				</Hidden>
				<div className={classes.filler} />
				<div>
					{user ? (
						<Button component={Link} to="/" color="inherit">
							{t('Presentation.menu.enterApp')}
						</Button>
					) : (
						<Button component={Link} to="/login" color="inherit">
							{t('common.signIn')}
						</Button>
					)}
				</div>
			</Toolbar>
		</AppBar>
	)
}

export default TopBar
