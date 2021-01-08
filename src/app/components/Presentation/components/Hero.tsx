import React from 'react'
import {
	createStyles,
	makeStyles,
	Typography,
	Container,
} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import ContactButton from './ContactButton'

const hero = require('../images/hero.svg')

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
		},
		title: {
			marginBottom: theme.spacing(4),
		},
		'subtitle': {
			marginBottom: theme.spacing(4),
		},
		image: {
			maxWidth: theme.spacing(90),
			width: '100%',
			display: 'block',
		},
		text: {
			flex: 1,
		},
		smallImage: {
			[theme.breakpoints.up(850)]: {
				display: 'none',
			},
			maxWidth: theme.spacing(70),
			marginBottom: theme.spacing(4),
			display: 'block',
			width: '100%',
		},
		imageContainer: {
			flex: 2,
			[theme.breakpoints.down(850)]: {
				display: 'none',
			},
		},
	})
)

function Hero({className}: {className?: string}) {
	const classes = useStyles()
	const {t} = useTranslation()
	return (
		<Container maxWidth="lg" className={`${classes.root} ${className}`}>
			<div className={classes.text}>
				<Typography className={classes.title} variant="h2">
					{t('Presentation.hero.title')}
				</Typography>
				<img className={classes.smallImage} src={hero} alt="" />
				<Typography className={classes.subtitle} variant="subtitle1">
					{t('Presentation.hero.subtitle')}
				</Typography>
				<ContactButton />
			</div>
			<div className={classes.imageContainer}>
				<img className={classes.image} src={hero} alt="" />
			</div>
		</Container>
	)
}

export default Hero
