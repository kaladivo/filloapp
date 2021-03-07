import React, {useCallback} from 'react'
import {Checkbox, FormControlLabel} from '@material-ui/core'
import {BlueprintFieldOptions} from '../../../../constants/models/Blueprint'

interface Props {
	className?: string
	optionName: string
	optionsObject: BlueprintFieldOptions
	onChange: (value: BlueprintFieldOptions) => any
	label: string
}

function OptionCheckbox({
	optionName,
	optionsObject,
	label,
	onChange,
	className,
}: Props) {
	const handleChange = useCallback(
		(e, value) => {
			onChange({...optionsObject, [optionName]: value})
		},
		[onChange, optionsObject, optionName]
	)

	return (
		<FormControlLabel
			className={className}
			onChange={handleChange}
			checked={!!optionsObject[optionName]}
			control={<Checkbox />}
			label={label}
		/>
	)
}

export default OptionCheckbox
