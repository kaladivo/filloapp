import React from 'react'
import {Typography, Button} from '@material-ui/core'
import {useTranslation} from 'react-i18next'

function RetryableError({
	error,
	text,
	onTryAgain,
}: {
	error: Error
	text?: string
	onTryAgain?: () => void
}) {
	console.info('Rendering error', error)
	const {t} = useTranslation()

	let errorMessage = error.message
	// @ts-ignore
	const errorResponse = error.response
	if (errorResponse) {
		errorMessage = t(
			`errors.${errorResponse.data?.errorCode}`,
			errorResponse.data?.message || errorMessage,
			{}
		)
	}

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
				{text} - {errorMessage}
			</Typography>
			{onTryAgain && <Button onClick={onTryAgain}>Try again</Button>}
		</div>
	)
}
export default RetryableError
