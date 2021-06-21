import React from 'react'
import clsx from 'clsx'
import {Container, createStyles, makeStyles} from '@material-ui/core'
import {useTranslation} from 'react-i18next'

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
	const {t} = useTranslation()
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
					src={t('Presentation.showcaseVideoSrc')}
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
