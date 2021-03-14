import React from 'react'
import {
	Button,
	Checkbox,
	createStyles,
	FormControl,
	FormControlLabel,
	makeStyles,
	Typography,
} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import DriveFilePickerButton from '../../DriveFilePickerButton'

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {
			'& > *': {
				display: 'block',
				margin: theme.spacing(0, 0, 2),
			},
		},
		folderPicker: {},
		folderPickerButtonAndState: {
			display: 'flex',
			alignItems: 'center',
		},
		folderPickerButton: {
			marginRight: theme.spacing(1),
		},
		buttons: {
			display: 'flex',
			'& > *': {
				margin: theme.spacing(0, 1),
			},
		},
		checkboxes: {
			'& > * ': {display: 'block'},
		},
	})
)

export interface SubmitSettingsState {
	generatePdfs: boolean
	generateMasterPdf: boolean
	outputFolder: {
		id: string
		name?: string
	} | null
}

interface Props {
	onNext: () => void
	values: SubmitSettingsState
	onChange: (values: SubmitSettingsState) => void
	onBack: () => void
}

function SettingsScreen({onNext, values, onChange, onBack}: Props) {
	const classes = useStyles()
	const {t} = useTranslation()

	const canBeSubmitted = !!values.outputFolder

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				onNext()
			}}
			className={classes.root}
		>
			<div className={classes.folderPicker}>
				<Typography variant="h6">
					{t('SubmitBlueprintsGroupScreen.selectOutputFolder')}
				</Typography>
				<div className={classes.folderPickerButtonAndState}>
					<DriveFilePickerButton
						className={classes.folderPickerButton}
						variant="contained"
						color="primary"
						label={t('SubmitBlueprintsGroupScreen.select')}
						pickerTitle={t('SubmitBlueprintsGroupScreen.selectOutputFolder')}
						onSelected={(selected) => {
							onChange({...values, outputFolder: selected[0] || null})
						}}
						pickerMode="folders"
					/>
					<Typography>
						{t('SubmitBlueprintsGroupScreen.selectedOutputFolder', {
							name: values.outputFolder ? values.outputFolder.name : 'none',
						})}
					</Typography>
				</div>
			</div>
			<FormControl className={classes.checkboxes}>
				<FormControlLabel
					label={t('SubmitBlueprintsGroupScreen.generatePdfs')}
					control={
						<Checkbox
							checked={values.generatePdfs}
							onChange={(_, checked) => {
								onChange({...values, generatePdfs: checked})
							}}
						/>
					}
				/>
				<FormControlLabel
					label={t('SubmitBlueprintsGroupScreen.generateMasterPdf')}
					control={
						<Checkbox
							checked={values.generateMasterPdf}
							onChange={(_, checked) => {
								onChange({...values, generateMasterPdf: checked})
							}}
						/>
					}
				/>
			</FormControl>
			<div className={classes.buttons}>
				<Button
					disabled={!canBeSubmitted}
					type="submit"
					variant="contained"
					color="primary"
				>
					{t('SubmitBlueprintsGroupScreen.generate')}
				</Button>
				<Button variant="outlined" color="primary" onClick={onBack}>
					{t('common.back')}
				</Button>
			</div>
		</form>
	)
}

export default SettingsScreen
