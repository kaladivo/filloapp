import React from 'react'
import {
	createStyles,
	FormControl,
	makeStyles,
	InputLabel,
	Select,
	MenuItem,
	FormControlLabel,
	Checkbox,
} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {
	BlueprintField as BlueprintFieldI,
	BlueprintField,
	BlueprintFieldType,
} from '../../../../constants/models/Blueprint'

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

	return (
		<div className={`${classes.root} ${className}`}>
			<FormControl fullWidth>
				<InputLabel id="demo-simple-select-label">Age</InputLabel>
				<Select
					labelId="demo-simple-select-label"
					id="demo-simple-select"
					value={field.type}
					onChange={(event) => {
						const value = event.target.value as BlueprintFieldType
						onChange({...field, type: value})
					}}
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
					<FormControlLabel
						control={<Checkbox name="checkedC" />}
						label={t('EditBlueprintScreen.multilineLabel')}
					/>
				</div>
			)}
			{field.type === 'date' && <div>TODO options for date</div>}

			{field.type === 'number' && <div>TODO options for number</div>}

			{field.type === 'select' && <div>TODO options for select</div>}
		</div>
	)
}

export default FieldTypeEdit
