import React from 'react'
import {
	Button,
	Card,
	CardContent,
	createStyles,
	makeStyles,
	Typography,
} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {Link} from 'react-router-dom'
import {Blueprint} from '../../../../constants/models/Blueprint'
import OwnerInfoDisplay from '../../OwnerInfoDisplay'

const useStyles = makeStyles(() =>
	createStyles({
		root: {},
		buttons: {},
	})
)

interface Props {
	className?: string
	blueprint: Blueprint
}

function BlueprintPreview({className, blueprint}: Props) {
	const classes = useStyles()
	const {t} = useTranslation()
	return (
		<Card className={`${classes.root} ${className}`}>
			<CardContent>
				<Typography variant="h6">{blueprint.name}</Typography>
				<div className={classes.buttons}>
					<OwnerInfoDisplay ownerInfo={blueprint.owner} />
					<Button
						component={Link}
						to={`blueprints/${blueprint.id}/edit`}
						variant="contained"
						color="primary"
					>
						{t('BlueprintsListScreen.edit')}
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}

export default BlueprintPreview
