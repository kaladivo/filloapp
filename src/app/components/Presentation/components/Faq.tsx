import React from 'react'
import {
	Container,
	createStyles,
	makeStyles,
	Typography,
} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import FaqItem from './FaqItem'

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {
			marginTop: theme.spacing(17),
		},
		itemsContainer: {
			marginTop: theme.spacing(8),
		},
	})
)

function Faq() {
	const classes = useStyles()
	const {t} = useTranslation()
	return (
		<Container maxWidth="lg" className={classes.root}>
			<Typography align="center" variant="h3">
				{t('Presentation.faq.title')}
			</Typography>
			<div className={classes.itemsContainer}>
				<FaqItem
					title={t('Presentation.faq.1.title')}
					text={t('Presentation.faq.1.text')}
				/>
				<FaqItem
					title={t('Presentation.faq.2.title')}
					text={t('Presentation.faq.2.text')}
				/>
				<FaqItem
					title={t('Presentation.faq.3.title')}
					text={t('Presentation.faq.3.text')}
				/>
			</div>
		</Container>
	)
}

export default Faq
