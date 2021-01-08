import React from 'react'
import {
	Container,
	createStyles,
	makeStyles,
	Typography,
} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import AboutBlock from './AboutBlock'
import ContactButton from './ContactButton'

const image1 = require('../images/expl1.svg')
const image2 = require('../images/expl2.svg')
const image3 = require('../images/expl3.svg')

const icons = [
	// eslint-disable-next-line global-require
	require('../images/drive.svg'),
	// eslint-disable-next-line global-require
	require('../images/pdf.svg'),
	// eslint-disable-next-line global-require
	require('../images/sheets.svg'),
	// eslint-disable-next-line global-require
	require('../images/docs.svg'),
]

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {},

		items: {
			margin: theme.spacing(0, 0, -25),
			'& > *': {margin: theme.spacing(25, 0)},
		},
		integrationsContainer: {
			paddingTop: theme.spacing(25),
		},
		integrationsText: {
			marginBottom: theme.spacing(10),
		},
		icons: {
			display: 'flex',
			justifyContent: 'space-between',
			width: theme.spacing(93),
			margin: '0 auto',
		},
		buttonContainer: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			marginTop: theme.spacing(10),
		},
	})
)

function About() {
	const classes = useStyles()
	const {t} = useTranslation()
	return (
		<Container maxWidth="lg" className={classes.root}>
			<div className={classes.items}>
				<AboutBlock
					title={t('Presentation.about.1.title')}
					subtitle={t('Presentation.about.1.subtitle')}
					image={image1}
					flow="left"
				/>
				<AboutBlock
					title={t('Presentation.about.2.title')}
					subtitle={t('Presentation.about.2.subtitle')}
					image={image2}
					flow="right"
				/>
				<AboutBlock
					title={t('Presentation.about.3.title')}
					subtitle={t('Presentation.about.3.subtitle')}
					image={image3}
					flow="left"
				/>
			</div>
			<div className={classes.integrationsContainer}>
				<Typography
					className={classes.integrationsText}
					align="center"
					variant="h3"
				>
					{t('Presentation.about.integrations')}
				</Typography>
				<div className={classes.icons}>
					{icons.map((icon) => (
						<img src={icon} alt="" key={icon} />
					))}
				</div>
				<div className={classes.buttonContainer}>
					<ContactButton />
				</div>
			</div>
		</Container>
	)
}

export default About
