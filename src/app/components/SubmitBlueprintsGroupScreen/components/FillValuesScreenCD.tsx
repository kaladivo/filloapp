import React, {useState, useEffect} from 'react'
import {Button, Grid, TextField, Typography} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import Autocomplete from '@material-ui/lab/Autocomplete'
import {GroupField} from '../../../../constants/models/BlueprintsGroup'
import StringField from './StringField'
import IncrementingField from './IncrementingField'

const disabledFields = [
	'Supplier_DIC',
	'Supplier_ICO',
	'Supplier_Name',
	'Supplier_Office',
]

const PRICE_FIELD_NAME = 'Order_Price_VAT'
const PRICE_FIELD_LIMIT = 200000

const SUPPLIERS_LIST = [
	{
		name: 'cd1',

		'Supplier_DIC': 'dic1',
		'Supplier_ICO': 'ico: 1',
		'Supplier_Name': 'name1',
		'Supplier_Office': 'office1',
	},
	{
		name: 'cd2',
		'Supplier_DIC': 'dic2',
		'Supplier_ICO': 'ico: 2',
		'Supplier_Name': 'name2',
		'Supplier_Office': 'office2',
	},
]

interface Props {
	fields: GroupField[]
	values: {[key: string]: string}
	onSubmit: () => void
	onChange: (data: {[id: string]: string}) => void
}

function FillValuesScreenCD({fields, values, onChange, onSubmit}: Props) {
	const {t} = useTranslation()
	const [selectedEntity, setSelectedEntity] = useState<any | null>(null)

	const ids = fields.filter((one) => !one.types.includes('string'))
	const otherFields = fields.filter((one) => one.types.includes('string'))

	useEffect(() => {
		if (!selectedEntity) {
			onChange({
				...values,
				...disabledFields.reduce((prev, cur) => ({...prev, [cur]: ''}), {}),
			})
			return
		}

		const valuesToChange = disabledFields.reduce((prev, fieldName) => {
			return {...prev, [fieldName]: selectedEntity[fieldName] || ''}
		}, {})
		onChange({...values, ...valuesToChange})
	}, [selectedEntity])

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				onSubmit()
			}}
		>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<Autocomplete
						options={SUPPLIERS_LIST}
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
				{[...ids, ...otherFields].map(({name, types}, i) => (
					<Grid key={name} item xs={12}>
						{types.length === 1 && types[0] === 'string' ? (
							<>
								<StringField
									disabled={disabledFields.includes(name)}
									helperText={
										disabledFields.includes(name)
											? t('CDSpecific.autofillFromEntity')
											: undefined
									}
									autoFocus={i === 0}
									label={name}
									value={values[name]}
									onChange={(e) => {
										const {value} = e.target
										onChange({...values, [name]: value})
									}}
								/>
								{name === PRICE_FIELD_NAME &&
									Number(values[PRICE_FIELD_NAME]) >= PRICE_FIELD_LIMIT && (
										<Typography color="secondary">
											{t('CDSpecific.priceExceeded')}
										</Typography>
									)}
							</>
						) : (
							<IncrementingField
								label={name}
								type={types[0]}
								value={values[name]}
							/>
						)}
					</Grid>
				))}
				<Grid item xs={12}>
					<Button fullWidth type="submit" variant="contained" color="primary">
						{t('common.submit')}
					</Button>
				</Grid>
			</Grid>
		</form>
	)
}

export default FillValuesScreenCD
