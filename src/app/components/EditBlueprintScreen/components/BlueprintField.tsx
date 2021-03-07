import React from 'react'
import {
	createStyles,
	makeStyles,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Typography,
	withStyles,
} from '@material-ui/core'
import {ExpandMore} from '@material-ui/icons'
import {BlueprintField as BlueprintFieldI} from '../../../../constants/models/Blueprint'
import BlueprintFieldEdit from './BlueprintFieldEdit'

interface Props {
	className?: string
	value: BlueprintFieldI
	onChange: (field: BlueprintFieldI) => void
	expanded: boolean
	onExpand: (value: boolean, blueprint: BlueprintFieldI) => void
	onDelete: (id: string) => void
}

const StyledAccordionSummary = withStyles({
	root: {
		borderBottom: '1px solid rgba(0, 0, 0, .125)',
		marginBottom: -1,
		minHeight: 56,
		'&$expanded': {
			minHeight: 56,
		},
	},
	content: {
		'&$expanded': {
			margin: '12px 0',
		},
	},
	expanded: {},
})(AccordionSummary)

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {width: '100%'},
		heading: {
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			// fontSize: theme.typography.pxToRem(15),
			flexBasis: '33.33%',
			flexShrink: 0,
		},
		secondaryHeading: {
			// fontSize: theme.typography.pxToRem(15),
			color: theme.palette.text.secondary,
		},
	})
)

function BlueprintField({
	className,
	value,
	onChange,
	expanded,
	onExpand,
	onDelete,
}: Props) {
	const classes = useStyles()

	return (
		<Accordion
			className={`${className} ${classes.root}`}
			expanded={!!expanded}
			onChange={(_, newValue) => onExpand(newValue, value)}
		>
			<StyledAccordionSummary
				expandIcon={<ExpandMore />}
				aria-controls="panel1bh-content"
				id="panel1bh-header"
			>
				<Typography className={classes.heading}>
					{value.displayName || value.name}
				</Typography>
				<Typography className={classes.secondaryHeading}>
					{value.type}
				</Typography>
			</StyledAccordionSummary>
			<AccordionDetails>
				<BlueprintFieldEdit
					onDelete={onDelete}
					value={value}
					onChange={onChange}
				/>
			</AccordionDetails>
		</Accordion>
	)
}

export default React.memo(BlueprintField)
