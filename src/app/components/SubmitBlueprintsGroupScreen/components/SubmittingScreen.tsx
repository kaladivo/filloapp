import React from 'react'
import {CircularProgress, Typography} from '@material-ui/core'

function LoadingScreen() {
	return (
		<div
			style={{
				width: '100%',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
			}}
		>
			<CircularProgress size={70} />
			<br />
			<Typography />
		</div>
	)
}

export default LoadingScreen
