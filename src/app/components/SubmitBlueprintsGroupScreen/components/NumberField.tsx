import React, {useEffect, useState} from 'react'
import {createStyles, makeStyles, TextField} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
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

function NumberField({className, field, value, onChange}: Props) {
	const classes = useStyles()
	const {t} = useTranslation()
	const {min, max} = field.options
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const valueNumber = Number(value)
		if (isNaN(valueNumber)) {
			setError(t('SubmitBlueprintsGroupScreen.valueIsNotNumber'))
			return
		}
		if (min !== undefined && valueNumber < min) {
			setError(t('SubmitBlueprintsGroupScreen.minValueExceeded', {min}))
			return
		}
		if (max !== undefined && valueNumber > max) {
			setError(t('SubmitBlueprintsGroupScreen.maxValueExceeded', {max}))
			return
		}
		setError(null)
	}, [value, min, max, setError, t])

	return (
		<TextField
			className={`${classes.root} ${className}`}
			margin="normal"
			error={!!error}
			fullWidth
			label={error || field.name || field.displayName}
			helperText={field.helperText}
			value={value}
			onChange={(e) => onChange(e.target.value, field)}
		/>
	)
}

export default NumberField
