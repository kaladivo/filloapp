import React from 'react'
import {Typography, Button} from '@material-ui/core'

function RetryableError({
	error,
	text,
	onTryAgain,
}: {
	error: Error
	text?: string
	onTryAgain: () => void
}) {
	console.info('Rendering error', error)
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				textAlign: 'center',
			}}
		>
			<Typography color="error">
				{text} {error.message}
			</Typography>
			<Button onClick={onTryAgain}>Try again</Button>
		</div>
	)
}
export default RetryableError
