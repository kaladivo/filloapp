import React from 'react'
import {Grid, Typography, Button} from '@material-ui/core'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'

interface Props {
	resultUrl: string
	onGoBack: () => void
}

function SuccessScreen({resultUrl, onGoBack}: Props) {
	return (
		<Grid
			style={{textAlign: 'center'}}
			alignItems="center"
			container
			spacing={2}
		>
			<Grid alignItems="center" item xs={12}>
				<CheckCircleIcon fontSize="large" style={{color: 'green'}} />
			</Grid>
			<Grid alignItems="center" item xs={12}>
				<Typography variant="h5">Smlouvy vygenerovány</Typography>
			</Grid>
			<Grid alignItems="center" item xs={12}>
				<Button
					target="_blank"
					href={resultUrl}
					color="primary"
					variant="contained"
				>
					Přejít na vygenerované smlouvy
				</Button>
			</Grid>
			<Grid alignItems="center" item xs={12}>
				<Button
					size="small"
					color="primary"
					variant="outlined"
					onClick={() => onGoBack()}
				>
					Vrátit se zpět
				</Button>
			</Grid>
		</Grid>
	)
}

export default SuccessScreen
