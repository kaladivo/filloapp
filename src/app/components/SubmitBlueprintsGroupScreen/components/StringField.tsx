import React, {ChangeEvent} from 'react'
import {TextField} from '@material-ui/core'

function StringField({
	label,
	value,
	onChange,
	autoFocus,
}: {
	label: string
	value: string
	onChange: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void
	autoFocus?: boolean
}) {
	return (
		<TextField
			margin="normal"
			fullWidth
			autoFocus={autoFocus}
			label={label}
			value={value}
			onChange={onChange}
		/>
	)
}

export default StringField
