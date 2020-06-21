import React from 'react'
import {useTranslation} from 'react-i18next'
import {
	Typography,
	makeStyles,
	createStyles,
	IconButton,
	Button,
} from '@material-ui/core'
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf'
import DescriptionIcon from '@material-ui/icons/Description'
import {BlueprintsGroupSubmit} from '../../../../constants/models/BlueprintsGroupSubmit'

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {},
		file: {
			display: 'flex',
			alignItems: 'center',
		},
		folderButton: {
			margin: theme.spacing(2, 0, 1),
		},
	})
)

interface Props {
	className?: string
	submit: BlueprintsGroupSubmit
}

function GeneratedFilesList({className, submit}: Props) {
	const {t} = useTranslation()
	const classes = useStyles()
	return (
		<div className={className}>
			<Button
				className={classes.folderButton}
				variant="outlined"
				color="secondary"
				size="small"
				target="_blank"
				href={`https://drive.google.com/drive/folders/${submit.folderId}?usp=sharing`}
			>
				{t('BlueprintsGroupDetailScreen.goToFolderButton')}
			</Button>
			{submit.generatedFiles.map((oneFile) => (
				<div key={oneFile.id} className={classes.file}>
					{oneFile.pdfId && (
						<IconButton
							target="_blank"
							href={`https://drive.google.com/file/d/${oneFile.pdfId}/view?usp=sharing`}
						>
							<PictureAsPdfIcon />
						</IconButton>
					)}
					{oneFile.googleDocId && (
						<IconButton
							target="_blank"
							href={`https://drive.google.com/file/d/${oneFile.googleDocId}/view?usp=sharing`}
						>
							<DescriptionIcon />
						</IconButton>
					)}
					<Typography> {oneFile.name}</Typography>
				</div>
			))}
		</div>
	)
}

export default GeneratedFilesList
