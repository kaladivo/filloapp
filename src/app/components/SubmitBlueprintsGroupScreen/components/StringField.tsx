import React, {ChangeEvent} from 'react'
import {TextField} from '@material-ui/core'

function StringField({
	label,
	value,
	onChange,
	autoFocus,
	disabled,
	helperText,
	multiline,
}: {
	label: string
	value: string
	onChange: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void
	autoFocus?: boolean
	disabled?: boolean
	helperText?: string
	multiline?: boolean
}) {
	return (
		<TextField
			margin="normal"
			fullWidth
			disabled={disabled}
			autoFocus={autoFocus}
			label={label}
			value={value}
			helperText={helperText}
			onChange={onChange}
			multiline={multiline}
			rows={multiline ? 2 : 1}
			rowsMax={20}
		/>
	)
}

export default StringField
