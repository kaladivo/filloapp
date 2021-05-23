import React from 'react'
import StringField from './components/StringField'
import DateField from './components/DateField'
import NumberField from './components/NumberField'
import SelectField from './components/SelectField'
import sentry from '../../utils/sentry'
import AresField from './components/AresField'
import {BlueprintField as BlueprintFieldI} from '../../../constants/models/Blueprint'

function getCorrectFieldComponent(type: string) {
	switch (type) {
		case 'string':
			return StringField
		case 'date':
			return DateField
		case 'number':
			return NumberField
		case 'select':
			return SelectField
		case 'ares':
			return AresField
		default:
			console.warn(`Field component for ${type} does not exist`)
			sentry.captureMessage(`Field component for ${type} does not exist`)
			return null
	}
}

export interface FieldOptions {
	name: string
	type: string
	displayName: string
	helperText: string | null
	defaultValue: string | null
	options: any
}

export interface FieldProps {
	className?: string
	field: FieldOptions
	value: string
	onChange: (newValue: string, field: FieldOptions) => void
	allFields: BlueprintFieldI[]
}

function BlueprintField({
	className,
	field,
	value,
	onChange,
	allFields,
}: FieldProps) {
	const FieldComponent = getCorrectFieldComponent(field.type)

	if (!FieldComponent) return null

	return (
		<FieldComponent
			className={className}
			field={field}
			value={value}
			onChange={onChange}
			allFields={allFields}
		/>
	)
}

export default BlueprintField
