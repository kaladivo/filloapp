import React from 'react'
import {
	Card,
	CardContent,
	Typography,
	Button,
	makeStyles,
	createStyles,
} from '@material-ui/core'
import {Link} from 'react-router-dom'
import moment from 'moment'
import {BlueprintsGroupPreview} from '../../../../constants/models/BlueprintsGroup'
import OwnerInfoDisplay from '../../OwnerInfoDisplay'

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {},
		button: {
			marginTop: theme.spacing(1),
		},
		author: {
			display: 'flex',
			alignItems: 'center',
		},
		projectName: {
			fontSize: '1rem',
		},
		authorPhoto: {
			height: theme.spacing(5),
			borderRadius: '100%',
			marginLeft: theme.spacing(1),
		},
	})
)
interface Props {
	className?: string
	blueprintGroup: BlueprintsGroupPreview
}

function BlueprintsGroupItem({className, blueprintGroup}: Props) {
	const classes = useStyles()
	return (
		<Card className={className}>
			<CardContent>
				<Typography variant="h6">{blueprintGroup.name}</Typography>
				{blueprintGroup.projectName && (
					<Typography className={classes.projectName}>
						{blueprintGroup.projectName}
					</Typography>
				)}
				<Typography>
					{moment(blueprintGroup.createdAt).format('DD. MMMM YYYY')}
				</Typography>
				<OwnerInfoDisplay
					ownerInfo={blueprintGroup.owner}
					className={classes.author}
				/>
				<Button
					className={classes.button}
					variant="contained"
					color="primary"
					component={Link}
					to={`/blueprints-group/${blueprintGroup.id}`}
				>
					Detail
				</Button>
			</CardContent>
		</Card>
	)
}

export default BlueprintsGroupItem
