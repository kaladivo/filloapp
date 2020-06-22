import React from 'react'
import {Button, Grid} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {GroupField} from '../../../../constants/models/BlueprintsGroup'
import StringField from './StringField'
import IncrementingField from './IncrementingField'

interface Props {
	fields: GroupField[]
	values: {[key: string]: string}
	onSubmit: () => void
	onChange: (data: {[id: string]: string}) => void
}

function FillValuesScreen({fields, values, onChange, onSubmit}: Props) {
	const {t} = useTranslation()

	const ids = fields.filter((one) => !one.types.includes('string'))
	const otherFields = fields.filter((one) => one.types.includes('string'))

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				onSubmit()
			}}
		>
			<Grid container spacing={2}>
				{[...ids, ...otherFields].map(({name, types}, i) => (
					<Grid key={name} item xs={12}>
						{types.length === 1 && types[0] === 'string' ? (
							<StringField
								autoFocus={i === 0}
								label={name}
								value={values[name]}
								onChange={(e) => {
									const {value} = e.target
									onChange({...values, [name]: value})
								}}
							/>
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

export default FillValuesScreen
