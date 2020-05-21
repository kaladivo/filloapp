import React from 'react'
import {Grid, Typography, Button} from '@material-ui/core'

function TryAgainScreen({
	error,
	goBack,
	tryAgain,
}: {
	error: Error
	goBack: () => void
	tryAgain: () => void
}) {
	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<Typography align="center" color="error">
					Stala se chyba při generování smluv. {error.message}
				</Typography>
			</Grid>
			<Grid item xs={12}>
				<Button
					fullWidth
					variant="contained"
					color="primary"
					onClick={() => tryAgain()}
				>
					Zkusit znovu
				</Button>
			</Grid>
			<Grid item xs={12}>
				<Button
					fullWidth
					variant="outlined"
					color="primary"
					onClick={() => goBack()}
				>
					Zpet
				</Button>
			</Grid>
		</Grid>
	)
}

export default TryAgainScreen
