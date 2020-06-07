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
import {useTranslation} from 'react-i18next'
import {BlueprintsGroupPreview} from '../../../../constants/models/BlueprintsGroup'

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
	const {t} = useTranslation()
	return (
		<Card className={className}>
			<CardContent>
				<Typography variant="h6">{blueprintGroup.name}</Typography>
				<Typography>
					{moment(blueprintGroup.createdAt).format('DD. MMMM YYYY')}
				</Typography>
				<div className={classes.author}>
					<Typography>
						{t('BlueprintsGroupScreen.createdBy', {
							name: blueprintGroup.owner.info.name,
						})}
					</Typography>
					<img
						alt=""
						src={blueprintGroup.owner.info.picture}
						className={classes.authorPhoto}
					/>
				</div>
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
