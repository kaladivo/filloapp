import React, {useCallback} from 'react'
import {createStyles, makeStyles, TextField} from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'
import {FieldProps} from '../index'

const useStyles = makeStyles(() =>
	createStyles({
		root: {},
	})
)

function SelectField({className, onChange, field, value}: FieldProps) {
	const classes = useStyles()

	const handleChange = useCallback(
		(_, newValue) => {
			onChange(newValue, field)
		},
		[onChange, field]
	)

	return (
		<Autocomplete
			fullWidth
			className={`${classes.root} ${className}`}
			options={field.options.selectOptions.map((one: any) => one.value)}
			getOptionLabel={(option) => option}
			onChange={handleChange}
			value={value}
			renderInput={(params) => (
				<TextField
					{...params}
					margin="normal"
					label={field.displayName || field.name}
					helperText={field.helperText}
					variant="standard"
				/>
			)}
		/>
	)
}

export default SelectField
