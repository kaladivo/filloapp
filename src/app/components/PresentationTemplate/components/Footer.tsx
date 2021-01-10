import React, {useCallback} from 'react'
import {
	createStyles,
	makeStyles,
	Typography,
	Link as MuiLink,
} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import RootContainer from '../../RootContainer'
import Link from '../../Link'

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {
			marginTop: theme.spacing(16),
			background: '#F2F2F2',
			padding: theme.spacing(7, 0),
		},
		innerContainer: {
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'baseline',
			[theme.breakpoints.down(700)]: {
				flexDirection: 'column',
			},
		},
		leftText: {
			fontSize: theme.typography.h5.fontSize,
		},
		menu: {
			margin: theme.spacing(0, -1, 0, 0),
			'& > *': {
				[theme.breakpoints.down(700)]: {
					display: 'block',
					margin: theme.spacing(0, 0),
				},
				margin: theme.spacing(0, 1),
				color: '#5B5C5F',
			},
		},
	})
)

function Footer({className}: {className?: string}) {
	const classes = useStyles()

	const {t} = useTranslation()

	const scrollToTop = useCallback(() => {
		window.scrollTo(0, 0)
	}, [])

	return (
		<div className={`${classes.root} ${className}`}>
			<RootContainer maxWidth="lg" className={classes.innerContainer}>
				<div>
					<Typography className={classes.leftText}>{t('appName')}</Typography>
				</div>
				<div className={classes.menu}>
					<MuiLink href="mailto:hynjin@gmail.com">
						{t('Presentation.footer.menu.contactUs')}
					</MuiLink>
					<Link to="/privacy-policy" onClick={scrollToTop}>
						{t('Presentation.footer.menu.privacyPolicy')}
					</Link>
					<Link to="/terms-of-service" onClick={scrollToTop}>
						{t('Presentation.footer.menu.terms')}
					</Link>
				</div>
			</RootContainer>
		</div>
	)
}

export default Footer
