import React, {useCallback} from 'react'
import {
	createStyles,
	FormControl,
	makeStyles,
	InputLabel,
	Select,
	MenuItem,
	Typography,
} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {
	BlueprintField as BlueprintFieldI,
	BlueprintField,
	BlueprintFieldType,
} from '../../../../constants/models/Blueprint'
import OptionCheckbox from './OptionCheckbox'
import NumberOptions from './NumberOptions'
import SelectOptions from './SelectOptions'

const useStyles = makeStyles(() =>
	createStyles({
		root: {},
	})
)

interface Props {
	className?: string
	field: BlueprintField
	onChange: (field: BlueprintFieldI) => void
}

function FieldTypeEdit({className, field, onChange}: Props) {
	const classes = useStyles()

	const {t} = useTranslation()

	const handleOptionsChange = useCallback(
		(options) => {
			onChange({...field, options})
		},
		[onChange, field]
	)

	const handleTypeChange = useCallback(
		(event) => {
			const value = event.target.value as BlueprintFieldType
			let initialOptions = {}
			if (value === 'select') {
				initialOptions = {selectOptions: [{id: Date.now(), value: ''}]}
			}

			onChange({...field, type: value, options: initialOptions})
		},
		[field, onChange]
	)

	if (field.type === 'id') {
		return (
			<div className={`${classes.root} ${className}`}>
				<Typography>{t('EditBlueprintScreen.typeIsIdExplanation')}</Typography>
			</div>
		)
	}

	return (
		<div className={`${classes.root} ${className}`}>
			<FormControl fullWidth margin="normal">
				<InputLabel id="demo-simple-select-label">
					{t('EditBlueprintScreen.typeSelectLabel')}
				</InputLabel>
				<Select
					labelId="demo-simple-select-label"
					id="demo-simple-select"
					value={field.type}
					onChange={handleTypeChange}
				>
					<MenuItem value="string">
						{t('EditBlueprintScreen.stringTypeLabel')}
					</MenuItem>
					<MenuItem value="date">
						{t('EditBlueprintScreen.dateTypeLabel')}
					</MenuItem>
					<MenuItem value="number">
						{t('EditBlueprintScreen.numberTypeLabel')}
					</MenuItem>
					<MenuItem value="select">
						{t('EditBlueprintScreen.selectTypeLabel')}
					</MenuItem>
				</Select>
			</FormControl>

			{field.type === 'string' && (
				<div>
					<OptionCheckbox
						optionName="multiline"
						optionsObject={field.options}
						onChange={handleOptionsChange}
						label={t('EditBlueprintScreen.multilineLabel')}
					/>
				</div>
			)}
			{field.type === 'date' && (
				<div>
					<OptionCheckbox
						optionName="withTime"
						optionsObject={field.options}
						onChange={handleOptionsChange}
						label={t('EditBlueprintScreen.withTimeLabel')}
					/>
				</div>
			)}

			{field.type === 'number' && (
				<NumberOptions options={field.options} onChange={handleOptionsChange} />
			)}

			{field.type === 'select' && (
				<SelectOptions options={field.options} onChange={handleOptionsChange} />
			)}
		</div>
	)
}

export default FieldTypeEdit
