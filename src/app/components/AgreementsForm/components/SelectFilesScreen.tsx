import React, {useState} from 'react'
import {
	FormControl,
	FormLabel,
	FormGroup,
	FormControlLabel,
	Checkbox,
	Button,
	Typography,
	Grid,
} from '@material-ui/core'
import {FormFile} from '../../../api/forms/model'

interface Props {
	values: FormFile[]
	checkedFiles: FormFile[]
	onSubmit: () => void
	onChange: (selected: FormFile[]) => void
}

function SelectFilesScreen({values, checkedFiles, onChange, onSubmit}: Props) {
	const [errorMessage, setErrorMessage] = useState<string>('')

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				if (checkedFiles.length <= 0) {
					setErrorMessage('Musíte vybrat alespoň jednu smlouvu!')
					return
				}
				setErrorMessage('')

				onSubmit()
			}}
		>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<FormControl component="fieldset">
						<FormLabel>Vyberte smlouvy které se mají vygenerovat</FormLabel>
						<FormGroup>
							{values.map((file) => (
								<FormControlLabel
									key={file.id}
									label={file.displayName}
									control={
										<Checkbox
											checked={checkedFiles.some(
												(oneFile) => file.id === oneFile.id
											)}
											onChange={(_, checked) => {
												if (!checked)
													onChange([
														...checkedFiles.filter((one) => one.id !== file.id),
													])
												else
													onChange([
														...checkedFiles.filter((one) => one.id !== file.id),
														file,
													])
											}}
											name={file.displayName}
										/>
									}
								/>
							))}
						</FormGroup>
					</FormControl>
				</Grid>
				{errorMessage && (
					<Grid item xs={12}>
						<Typography color="error">{errorMessage}</Typography>
					</Grid>
				)}
				<Grid item xs={12}>
					<Button fullWidth type="submit" variant="contained" color="primary">
						Další
					</Button>
				</Grid>
			</Grid>
		</form>
	)
}

export default SelectFilesScreen
