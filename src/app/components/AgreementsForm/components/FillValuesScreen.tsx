import React from 'react'
import {TextField, Button, Grid, Typography, Link} from '@material-ui/core'
import {FormFields} from '../../../api/forms/model'

interface Props {
	formFields: FormFields
	values: {[key: string]: string}
	onGoBack: () => void
	onSubmit: () => void
	onChange: (data: {[id: string]: string}) => void
}

function FillValuesScreen({
	formFields,
	values,
	onChange,
	onSubmit,
	onGoBack,
}: Props) {
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				onSubmit()
			}}
		>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<Typography variant="h5">
						Vyplnte hodnoty, které se dosadí do{' '}
						<Link
							href="https://drive.google.com/drive/folders/1p2zVJt_h2yUsF0QeZ5qTR9jutBOsSvwm"
							target="_blank"
						>
							předloh smluv
						</Link>
					</Typography>
				</Grid>
				{Object.keys(formFields).map((key, i) => (
					<Grid key={key} item xs={12}>
						<TextField
							margin="normal"
							fullWidth
							autoFocus={i === 0}
							label={formFields[key].name}
							helperText={formFields[key].description || undefined}
							value={values[key]}
							onChange={(e) => {
								const {value} = e.target
								onChange({...values, [key]: value})
							}}
						/>
					</Grid>
				))}
				<Grid item xs={12}>
					<Button fullWidth type="submit" variant="contained" color="primary">
						Potvrdit
					</Button>
				</Grid>
				<Grid item xs={12}>
					<Button
						fullWidth
						onClick={onGoBack}
						variant="outlined"
						color="primary"
					>
						Zpět
					</Button>
				</Grid>
			</Grid>
		</form>
	)
}

export default FillValuesScreen
