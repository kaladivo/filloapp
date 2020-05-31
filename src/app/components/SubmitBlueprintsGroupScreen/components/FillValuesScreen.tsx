import React from 'react'
import {TextField, Button, Grid} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {GroupField} from '../../../../constants/models/BlueprintsGroup'

interface Props {
	fields: GroupField[]
	values: {[key: string]: string}
	onSubmit: () => void
	onChange: (data: {[id: string]: string}) => void
}

function FillValuesScreen({fields, values, onChange, onSubmit}: Props) {
	const {t} = useTranslation()

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				onSubmit()
			}}
		>
			<Grid container spacing={2}>
				{fields.map(({name}, i) => (
					<Grid key={name} item xs={12}>
						<TextField
							margin="normal"
							fullWidth
							autoFocus={i === 0}
							label={name}
							value={values[name]}
							onChange={(e) => {
								const {value} = e.target
								onChange({...values, [name]: value})
							}}
						/>
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
