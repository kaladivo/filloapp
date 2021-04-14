import React, {useCallback, useMemo} from 'react'
import {createStyles, makeStyles} from '@material-ui/core'
import {DatePicker, DateTimePicker} from '@material-ui/pickers'
import moment, {Moment} from 'moment'
import {useTranslation} from 'react-i18next'
import {FieldProps} from '../index'

export function getDateFormatForSetting(withTime: boolean) {
	return withTime ? 'DD.MM.YYYY HH:mm' : 'DD.MM.YYYY'
}

const useStyles = makeStyles(() =>
	createStyles({
		root: {},
	})
)

function DateField({className, field, value, onChange}: FieldProps) {
	const {t} = useTranslation()
	const PickerToUse = field.options.withTime ? DateTimePicker : DatePicker
	const dateFormat = getDateFormatForSetting(field.options.withTime)

	const valueMoment = useMemo(() => {
		if (!value) return null
		return moment(value, dateFormat)
	}, [dateFormat, value])

	const handleChange = useCallback(
		(newValue?: Moment) => {
			if (!newValue) onChange('', field)
			else onChange(newValue.format(dateFormat), field)
		},
		[onChange, dateFormat, field]
	)

	const classes = useStyles()
	return (
		<PickerToUse
			clearable
			emptyLabel={t('BlueprintField.noDateSelected')}
			className={`${classes.root} ${className}`}
			margin="normal"
			fullWidth
			value={valueMoment}
			onChange={handleChange}
			format={dateFormat}
			label={field.displayName || field.name}
			helperText={field.helperText}
		/>
	)
}

export default DateField
