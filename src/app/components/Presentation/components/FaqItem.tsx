import React from 'react'
import {
	Accordion,
	AccordionSummary,
	Typography,
	AccordionDetails,
	makeStyles,
	createStyles,
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

const useStyles = makeStyles((theme) =>
	createStyles({
		heading: {
			fontSize: theme.typography.pxToRem(15),
			fontWeight: theme.typography.fontWeightRegular,
		},
	})
)

interface Props {
	title: string
	text: string
}

function FaqItem({title, text}: Props) {
	const classes = useStyles()
	return (
		<Accordion>
			<AccordionSummary
				expandIcon={<ExpandMoreIcon />}
				aria-controls="panel1a-content"
				id="panel1a-header"
			>
				<Typography className={classes.heading}>{title}</Typography>
			</AccordionSummary>
			<AccordionDetails>
				<Typography>{text}</Typography>
			</AccordionDetails>
		</Accordion>
	)
}

export default FaqItem
