import React, {useCallback} from 'react'
import {createStyles, makeStyles, TextField} from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'
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

function SelectField({className, onChange, field, value}: Props) {
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
