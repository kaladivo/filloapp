import React from 'react'
import {
	Typography,
	makeStyles,
	createStyles,
	Paper,
	Button,
} from '@material-ui/core'
import moment from 'moment'
import {useTranslation} from 'react-i18next'
import {Link} from 'react-router-dom'
import {BlueprintGroup} from '../../../../constants/models/BlueprintsGroup'
import GoogleFilePreview from '../../GoogleFilePreview'
import GeneratedFilesList from './GeneratedFilesList'
import BackBreadcrumb from '../../BackBreadcrumb'
import DeleteButton from './DeleteButton'

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {
			padding: theme.spacing(1, 2),
			'& > *': {
				margin: theme.spacing(2, 0),
			},
		},
		header: {
			display: 'flex',
			justifyContent: 'space-between',
		},
		buttons: {
			display: 'flex',
			flexDirection: 'row-reverse',
			margin: theme.spacing(0, -1, 2),
			'& > *': {
				margin: theme.spacing(0, 1),
			},
		},
	})
)

interface Props {
	blueprintsGroup: BlueprintGroup
}

function BlueprintsGroupDetail({blueprintsGroup}: Props) {
	const {t} = useTranslation()
	const classes = useStyles()
	return (
		<div>
			<div className={classes.header}>
				<BackBreadcrumb to="/" text={t('common.goBack')} />

				<div className={classes.buttons}>
					<DeleteButton blueprintsGroupId={blueprintsGroup.id} />
					<Button
						variant="contained"
						color="primary"
						to={`/blueprints-group/${blueprintsGroup.id}/submit`}
						component={Link}
					>
						{blueprintsGroup.submits.length > 0
							? t('BlueprintsGroupDetailScreen.generateNew')
							: t('BlueprintsGroupDetailScreen.createSubmit')}
					</Button>
				</div>
			</div>
			<Paper className={classes.root}>
				<div>
					<Typography variant="h4">{blueprintsGroup.name}</Typography>
					<Typography>
						{t('BlueprintsGroupDetailScreen.createdAt', {
							date: moment(blueprintsGroup.createdAt).format('DD. MM. YYYY'),
						})}
					</Typography>
					<Typography>
						{t('BlueprintsGroupDetailScreen.projectName', {
							projectName: blueprintsGroup.projectName,
						})}
					</Typography>
				</div>

				<div>
					<Typography variant="h5">
						{t('BlueprintsGroupDetailScreen.generatedFiles')}
					</Typography>
					{blueprintsGroup.submits.length > 0 ? (
						<GeneratedFilesList submit={blueprintsGroup.submits[0]} />
					) : (
						<Typography>
							{t('BlueprintsGroupDetailScreen.noneGeneratedYet')}
						</Typography>
					)}
				</div>

				<div>
					<Typography variant="h5">
						{t('BlueprintsGroupDetailScreen.blueprints')}
					</Typography>
					{blueprintsGroup.blueprints.map((one) => {
						return (
							<Typography key={one.id}>
								<GoogleFilePreview
									file={{name: one.name, id: one.googleDocsId}}
								/>
							</Typography>
						)
					})}
				</div>
			</Paper>
		</div>
	)
}

export default BlueprintsGroupDetail
