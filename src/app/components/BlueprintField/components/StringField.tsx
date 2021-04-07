import React from 'react'
import {TextField} from '@material-ui/core'
import {FieldProps} from '../index'

function StringField({className, field, value, onChange}: FieldProps) {
	return (
		<TextField
			className={className}
			margin="normal"
			fullWidth
			// disabled={disabled}
			// autoFocus={autoFocus}
			label={field.displayName}
			value={value}
			helperText={field.helperText}
			onChange={(e) => onChange(e.target.value, field)}
			multiline={!!field.options.multiline}
			rows={field.options.multiline ? 2 : 1}
			rowsMax={20}
		/>
	)
}

export default StringField
