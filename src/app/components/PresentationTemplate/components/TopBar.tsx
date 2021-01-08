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

const useStyles = makeStyles((theme) =>
	createStyles({
		menuItems: {
			margin: theme.spacing(0, 2),
		},
		filler: {
			flex: 1,
		},
	})
)

function useNavigationItems() {
	const {t} = useTranslation()

	return [
		{
			name: t('Presentation.menu.about'),
			href: 'ble',
		},
		{
			name: t('Presentation.menu.faq'),
			href: 'ble',
		},
		{
			name: t('Presentation.common.getStarted'),
			href: 'ble',
		},
	]
}

function TopBar({className}: {className?: string}) {
	const {t} = useTranslation()
	const classes = useStyles()
	const navigationItems = useNavigationItems()

	return (
		<AppBar className={className} position="static">
			<Toolbar>
				<Typography variant="h6" noWrap>
					{t('appName')}
				</Typography>
				<Hidden xsDown>
					<div className={classes.menuItems}>
						{navigationItems.map((one) => (
							<Button key={one.name} color="inherit" href={one.href}>
								{one.name}
							</Button>
						))}
					</div>
				</Hidden>
				<div className={classes.filler} />
				<div>
					<Button component={Link} to="/login" color="inherit">
						{t('common.signIn')}
					</Button>
				</div>
			</Toolbar>
		</AppBar>
	)
}

export default TopBar
