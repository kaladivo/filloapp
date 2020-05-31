import React from 'react'
import {
	Typography,
	makeStyles,
	createStyles,
	Paper,
	Container,
	Button,
} from '@material-ui/core'
import moment from 'moment'
import {useTranslation} from 'react-i18next'
import {Link} from 'react-router-dom'
import {BlueprintGroup} from '../../../../constants/models/BlueprintsGroup'
import GoogleFilePreview from '../../GoogleFilePreview'

const useStyles = makeStyles(() =>
	createStyles({
		root: {},
	})
)

interface Props {
	className?: string
	blueprintsGroup: BlueprintGroup
}

function BlueprintsGroupDetail({className, blueprintsGroup}: Props) {
	const {t} = useTranslation()
	const classes = useStyles()
	return (
		<Container component={Paper} className={`${classes.root} ${className}`}>
			<Typography variant="h4">{blueprintsGroup.name}</Typography>
			{/* TODO localize date */}
			<Typography>
				{t('BlueprintsGroupDetail.createdAt', {
					date: moment(blueprintsGroup.createdAt).format('DD. MM. YYYY'),
				})}
			</Typography>

			<Button
				variant="contained"
				color="primary"
				to={`/blueprints-group/${blueprintsGroup.id}/submit`}
				component={Link}
			>
				Submit
			</Button>

			{blueprintsGroup.submits.length > 0 && (
				<>
					<Typography variant="h5">
						{t('BlueprintsGroupDetail.latestFiles')}
					</Typography>
					{blueprintsGroup.submits[0].generatedFiles.map((oneFile) => {
						return (
							<div>
								<GoogleFilePreview
									file={{name: oneFile.name, id: oneFile.googleDocId}}
								/>
							</div>
						)
					})}
				</>
			)}

			<Typography variant="h5">
				{t('BlueprintsGroupDetail.blueprints')}
			</Typography>
			{blueprintsGroup.blueprints.map((one) => {
				return (
					<div>
						<GoogleFilePreview file={{name: one.name, id: one.googleDocsId}} />
					</div>
				)
			})}
			<Typography variant="h5">{t('BlueprintsGroupDetail.submits')}</Typography>
			{blueprintsGroup.submits.map((oneSubmit) => {
				return (
					<div>
						<Typography>
							{t('BlueprintsGroupDetail.submitTitle', {
								date: moment(oneSubmit.submittedAt).fromNow(),
								name: oneSubmit.byUser.info.name,
							})}
						</Typography>
						{oneSubmit.generatedFiles.map((oneFile) => {
							return (
								<div>
									<GoogleFilePreview
										file={{name: oneFile.name, id: oneFile.googleDocId}}
									/>
								</div>
							)
						})}
					</div>
				)
			})}
		</Container>
	)
}

export default BlueprintsGroupDetail
