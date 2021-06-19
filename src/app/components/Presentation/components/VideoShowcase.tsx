import React from 'react'
import clsx from 'clsx'
import {Container, createStyles, makeStyles} from '@material-ui/core'

const useStyles = makeStyles(() =>
	createStyles({
		root: {},
		videoContainer: {
			position: 'relative',
			paddingBottom: '62.5%',
			height: 0,
		},
		video: {
			position: 'absolute',
			top: 0,
			left: 0,
			width: ' 100%',
			height: '100%',
		},
	})
)

interface Props {
	className?: string
}

function VideoShowcase({className}: Props): JSX.Element {
	const classes = useStyles()
	return (
		<Container
			id="video"
			maxWidth="lg"
			className={clsx(classes.root, className)}
		>
			<div className={classes.videoContainer}>
				<iframe
					className={classes.video}
					title="video"
					src="https://www.loom.com/embed/6a3fb642620f4d5ca8ad90266836d363"
					frameBorder="0"
					// @ts-ignore
					webkitallowfullscreen
					// @ts-ignore
					mozallowfullscreen
					allowFullScreen
				/>
			</div>
		</Container>
	)
}

export default VideoShowcase
