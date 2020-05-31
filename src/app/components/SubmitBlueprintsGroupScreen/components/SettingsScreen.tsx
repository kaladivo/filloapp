import React, {useState} from 'react'
import {
	Grid,
	FormControlLabel,
	Checkbox,
	Typography,
	Button,
	TextField,
} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {PickedDocument} from '../../DriveFilePickerButton/utils'
import DriveFilePickerButton from '../../DriveFilePickerButton'

export interface SettingsValues {
	generatePdfs: boolean
	outputFolder: PickedDocument | null
	name: string
}

interface Props {
	onNext: () => void
	values: SettingsValues
	onChange: (values: SettingsValues) => void
}

function SettingsScreen({onNext, values, onChange}: Props) {
	const {t} = useTranslation()

	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<TextField
					value={values.name}
					label={t('SubmitBlueprintsGroupScreen.name')}
					helperText={t('SubmitBlueprintsGroupScreen.nameHelp')}
					onChange={(e) => onChange({...values, name: e.target.value})}
				/>
			</Grid>
			<Grid item xs={12}>
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
			</Grid>
			<Grid item xs={12}>
				<Typography>
					{t('SubmitBlueprintsGroupScreen.selectOutputFolder')}
				</Typography>
				<Typography>
					{t('SubmitBlueprintsGroupScreen.selectedOutputFolder', {
						name: values.outputFolder?.name || 'none',
					})}
				</Typography>
				<DriveFilePickerButton
					label={t('SubmitBlueprintsGroupScreen.selectOutputFolder')}
					pickerTitle={t('SubmitBlueprintsGroupScreen.select')}
					onSelected={(selected) => {
						console.log('aha1', selected)
						onChange({...values, outputFolder: selected[0] || null})
					}}
					pickerMode="folders"
				/>
			</Grid>
			<Button variant="contained" color="primary" onClick={onNext}>
				Generate
			</Button>
		</Grid>
	)
}

export default SettingsScreen
