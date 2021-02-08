import React, {useCallback} from 'react'
import {
	AppBar,
	Toolbar,
	Typography,
	makeStyles,
	createStyles,
	Theme,
	IconButton,
	Menu,
	MenuItem,
} from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'
import {useTranslation} from 'react-i18next'
import {AccountCircle} from '@material-ui/icons'
import {useLogout, useUser} from '../../../utils/auth'
import {useCustomerSelector} from '../../CustomerSelectorProvider'

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
		userInfo: {
			display: 'flex',
			flexDirection: 'column',
			cursor: 'pointer',
			'& > *': {
				width: '100%',
				textAlign: 'right',
			},
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
	const user = useUser()
	const {t} = useTranslation()
	const {triggerSelect} = useCustomerSelector()

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
	const open = Boolean(anchorEl)

	const handleMenu = useCallback(
		(event: React.MouseEvent<HTMLElement>) => {
			setAnchorEl(event.currentTarget)
		},
		[setAnchorEl]
	)

	const handleClose = useCallback(() => {
		setAnchorEl(null)
	}, [setAnchorEl])

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
				{/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
				<div
					tabIndex={0}
					role="button"
					onClick={handleMenu}
					className={classes.userInfo}
				>
					<Typography className={classes.userEmail}>
						{t('TopBar.loggedAs', {email: user?.userInfo.email})}
					</Typography>
					<Typography
						variant="caption"
						className={classes.userEmail}
						onClick={handleMenu}
					>
						{user?.userInfo?.selectedCustomer?.name}
					</Typography>
				</div>
				<div>
					<IconButton
						aria-label="account of current user"
						aria-controls="menu-appbar"
						aria-haspopup="true"
						onClick={handleMenu}
						color="inherit"
					>
						<AccountCircle />
					</IconButton>
					<Menu
						id="menu-appbar"
						anchorEl={anchorEl}
						anchorOrigin={{
							vertical: 'top',
							horizontal: 'right',
						}}
						keepMounted
						transformOrigin={{
							vertical: 'top',
							horizontal: 'right',
						}}
						open={open}
						onClose={handleClose}
					>
						<MenuItem onClick={triggerSelect}>
							{t('TopBar.switchCustomer')}
						</MenuItem>
						<MenuItem onClick={logout}>{t('TopBar.logout')}</MenuItem>
					</Menu>
				</div>
			</Toolbar>
		</AppBar>
	)
}

export default TopBar
