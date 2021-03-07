import React, {useState, useEffect, useRef, useCallback} from 'react'
import {Button, Grid, TextField, Typography} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import Autocomplete from '@material-ui/lab/Autocomplete'
import {GroupField} from '../../../../constants/models/BlueprintsGroup'
import StringField from './StringField'
import IncrementingField from './IncrementingField'
import {useCustomerInfo} from '../../CustomerInfoProvider'
import DateField from './DateField'
import NumberField from './NumberField'
import SelectField from './SelectField'

function getFieldTypeBasedOnPriority(types: string[]): string {
	if (types.length === 1) return types[0]
	return 'string'
}

interface Props {
	fields: GroupField[]
	values: {[key: string]: string}
	onSubmit: () => void
	onChange: (data: {[id: string]: string}) => void
}

function FillValuesScreen({fields, values, onChange, onSubmit}: Props) {
	const {t} = useTranslation()
	const [selectedEntity, setSelectedEntity] = useState<any | null>(null)
	const customerInfo = useCustomerInfo()

	const disabledFields = customerInfo.entityFields?.disabledFields
	const suppliersList = customerInfo.entityFields?.suppliersList
	const priceFieldLimit = customerInfo.priceLimit?.limit
	const priceFieldName = customerInfo.priceLimit?.fieldName

	const ids = fields.filter((one) => one.types.includes('id'))
	const otherFields = fields.filter((one) => !one.types.includes('id'))

	const onFieldChange = useCallback(
		(value: string, field: GroupField) => {
			onChange({...values, [field.name]: value})
		},
		[onChange, values]
	)

	const valuesRef = useRef(values)
	useEffect(() => {
		valuesRef.current = values
	}, [values])

	// Populate values when entity changes
	useEffect(() => {
		if (!disabledFields) return
		// If no entity selected, make sure to empty disabled fields that depends on the entity.
		if (!selectedEntity) {
			onChange({
				...valuesRef.current,
				...disabledFields.reduce((prev, cur) => ({...prev, [cur]: ''}), {}),
			})
			return
		}

		// Populate fields based on selected entity
		const valuesToChange = disabledFields.reduce((prev, fieldName) => {
			return {...prev, [fieldName]: selectedEntity[fieldName] || ''}
		}, {})
		onChange({...valuesRef.current, ...valuesToChange})
	}, [selectedEntity, disabledFields, onChange, valuesRef])

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				onSubmit()
			}}
		>
			{/* CD specific start */}
			<Grid container spacing={2}>
				{!!suppliersList && (
					<Grid item xs={12}>
						<Autocomplete
							options={suppliersList}
							getOptionLabel={(option) => option.name}
							onChange={(e: any, newValue: any | null) => {
								setSelectedEntity(newValue)
							}}
							value={selectedEntity}
							renderInput={(params) => (
								<TextField
									margin="normal"
									{...params}
									label={t('CDSpecific.selectEntityLabel')}
									variant="outlined"
								/>
							)}
						/>
					</Grid>
				)}
				{ids.map(({name, types, displayName}) => (
					<IncrementingField
						label={displayName}
						type={types[0]}
						value={values[name]}
					/>
				))}
				{/* CD specific end */}

				{otherFields.map((fieldOptions, i) => {
					const {name, types, displayName, helperText, options} = fieldOptions
					// TODO make user choose or somehthing
					const type = getFieldTypeBasedOnPriority(types)

					return (
						<Grid key={name} item xs={12}>
							{type === 'string' && (
								<StringField
									disabled={(disabledFields || []).includes(name)}
									helperText={
										(disabledFields || []).includes(name)
											? `${helperText ? `${helperText} ` : ''} ${t(
													'CDSpecific.autofillFromEntity'
											  )}`
											: helperText || undefined
									}
									autoFocus={i === 0}
									label={displayName}
									value={values[name]}
									multiline={!!options.multiline}
									onChange={(e) => {
										const {value} = e.target
										onFieldChange(value, fieldOptions)
									}}
								/>
							)}

							{type === 'date' && (
								<DateField
									value={values[fieldOptions.name]}
									onChange={onFieldChange}
									field={fieldOptions}
								/>
							)}
							{type === 'number' && (
								<NumberField
									value={values[fieldOptions.name]}
									onChange={onFieldChange}
									field={fieldOptions}
								/>
							)}
							{type === 'select' && (
								<SelectField
									value={values[fieldOptions.name]}
									onChange={onFieldChange}
									field={fieldOptions}
								/>
							)}

							{/* Cd specific start */}
							{priceFieldLimit &&
								priceFieldName &&
								name === priceFieldName &&
								Number(values[priceFieldName]) >= priceFieldLimit && (
									<Typography color="secondary">
										{t('CDSpecific.priceExceeded')}
									</Typography>
								)}
							{/* Cd specific end */}
						</Grid>
					)
				})}
				<Grid item xs={12}>
					<Button fullWidth type="submit" variant="contained" color="primary">
						{t('common.submit')}
					</Button>
				</Grid>
			</Grid>
		</form>
	)
}

export default FillValuesScreen
