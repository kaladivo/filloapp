import React from 'react'
import {
	FormControlLabel,
	Checkbox,
	Typography,
	Button,
	TextField,
	makeStyles,
	createStyles,
	FormControl,
	Tooltip,
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

export interface SettingsValues {
	outputFolder: {
		name: string
		id: string
	} | null
	name: string
	generatePdfs: boolean
	generateMasterPdf: boolean
	generateDocuments: boolean
}

interface Props {
	onNext: () => void
	values: SettingsValues
	onChange: (values: SettingsValues) => void
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
			<TextField
				fullWidth
				value={values.name}
				label={t('SubmitBlueprintsGroupScreen.versionName')}
				helperText={t('SubmitBlueprintsGroupScreen.versionNameHelp')}
				onChange={(e) => onChange({...values, name: e.target.value})}
			/>
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
				<Tooltip title={t('common.notImplemented') || ''}>
					<FormControlLabel
						label={t('SubmitBlueprintsGroupScreen.generateMasterPdf')}
						disabled
						control={
							<Checkbox
								checked={values.generateMasterPdf}
								onChange={(_, checked) => {
									onChange({...values, generateMasterPdf: checked})
								}}
							/>
						}
					/>
				</Tooltip>
				<Tooltip title={t('common.notImplemented') || ''}>
					<FormControlLabel
						label={t('SubmitBlueprintsGroupScreen.generateDocuments')}
						disabled
						control={
							<Checkbox
								checked={values.generateDocuments}
								onChange={(_, checked) => {
									onChange({...values, generateDocuments: checked})
								}}
							/>
						}
					/>
				</Tooltip>
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
