import React, {useCallback, useMemo} from 'react'
import {createStyles, makeStyles} from '@material-ui/core'
import {DatePicker, DateTimePicker} from '@material-ui/pickers'
import moment, {Moment} from 'moment'
import {GroupField} from '../../../../constants/models/BlueprintsGroup'

const useStyles = makeStyles(() =>
	createStyles({
		root: {},
	})
)

interface Props {
	className?: string
	field: GroupField
	value: string
	onChange: (newValue: string, field: GroupField) => void
}

function DateField({className, field, value, onChange}: Props) {
	const PickerToUse = field.options.withTime ? DateTimePicker : DatePicker
	const dateFormat = field.options.withTime ? 'DD.MM.YYYY HH:mm' : 'DD.MM.YYYY'

	const valueMoment = useMemo(() => {
		if (!value) return moment()
		return moment(value, dateFormat)
	}, [dateFormat, value])

	const handleChange = useCallback(
		(newValue: Moment) => {
			onChange(newValue.format(dateFormat), field)
		},
		[onChange, dateFormat, field]
	)

	const classes = useStyles()
	return (
		<PickerToUse
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
