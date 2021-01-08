import React from 'react'
import {createStyles, makeStyles, Typography, useTheme} from '@material-ui/core'

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {
			display: 'flex',
			[theme.breakpoints.down(900)]: {
				flexDirection: 'column !important',
			},
		},
		innerContainer: {
			margin: theme.spacing(0, -18),
			'& > *': {
				marign: theme.spacing(0, 18),
			},
		},
		text: {
			flex: 1,
			[theme.breakpoints.down(900)]: {
				padding: '0 !important',
			},
		},
		title: {
			marginBottom: theme.spacing(2),
		},
		subtitle: {},
		imageContainer: {flex: 2},
		image: {
			width: '100%',
			[theme.breakpoints.down(900)]: {
				maxWidth: theme.spacing(50),
				marginTop: theme.spacing(4),
			},
		},
	})
)

interface Props {
	title: string
	subtitle: string
	image: string
	flow: 'left' | 'right'
}

function AboutBlock({title, subtitle, image, flow}: Props) {
	const theme = useTheme()
	const classes = useStyles()
	return (
		<div
			className={classes.root}
			style={{flexDirection: flow === 'left' ? 'row' : 'row-reverse'}}
		>
			<div
				className={classes.text}
				style={{
					paddingRight: flow === 'left' ? theme.spacing(25) : 0,
					paddingLeft: flow === 'right' ? theme.spacing(20) : 0,
				}}
			>
				<Typography variant="h4" className={classes.title}>
					{title}
				</Typography>
				<Typography className={classes.subtitle}>{subtitle}</Typography>
			</div>
			<div className={classes.imageContainer}>
				<img className={classes.image} src={image} alt="" />
			</div>
		</div>
	)
}

export default AboutBlock
