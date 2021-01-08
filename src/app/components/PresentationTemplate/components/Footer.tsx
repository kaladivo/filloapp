import React from 'react'
import {createStyles, makeStyles, Typography} from '@material-ui/core'
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
		},
		leftText: {
			fontSize: theme.typography.h5.fontSize,
		},
		menu: {
			margin: theme.spacing(0, -1, 0, 0),
			'& > *': {
				margin: theme.spacing(0, 1),
				color: '#5B5C5F',
			},
		},
	})
)

function Footer({className}: {className?: string}) {
	const classes = useStyles()

	const {t} = useTranslation()

	return (
		<div className={`${classes.root} ${className}`}>
			<RootContainer maxWidth="lg" className={classes.innerContainer}>
				<div>
					<Typography className={classes.leftText}>{t('appName')}</Typography>
				</div>
				<div className={classes.menu}>
					<Link to="/contact-us">
						{t('Presentation.footer.menu.contactUs')}
					</Link>
					<Link to="/privacy-policy">
						{t('Presentation.footer.menu.privacyPolicy')}
					</Link>
					<Link to="/terms-of-service">
						{t('Presentation.footer.menu.terms')}
					</Link>
				</div>
			</RootContainer>
		</div>
	)
}

export default Footer
