import React, {ChangeEvent} from 'react'
import {TextField} from '@material-ui/core'

function StringField({
	label,
	value,
	onChange,
	autoFocus,
	disabled,
	helperText,
}: {
	label: string
	value: string
	onChange: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void
	autoFocus?: boolean
	disabled?: boolean
	helperText?: string
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
		/>
	)
}

export default StringField
