import React from 'react'
import {createStyles, makeStyles, Typography} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {OwnerInfo} from '../../constants/models/OwnerInfo'

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {
			display: 'flex',
			alignItems: 'center',
		},
		authorPhoto: {
			height: theme.spacing(5),
			borderRadius: '100%',
			marginLeft: theme.spacing(1),
		},
	})
)

interface Props {
	className?: string
	ownerInfo: OwnerInfo
}

function OwnerInfoDisplay({className, ownerInfo}: Props) {
	const {t} = useTranslation()
	const classes = useStyles()
	return (
		<div className={`${classes.root} ${className}`}>
			<Typography>
				{t('OwnerInfo.createdBy', {
					name: ownerInfo.info.name,
				})}
			</Typography>
			<img
				alt=""
				src={ownerInfo.info.picture}
				className={classes.authorPhoto}
			/>
		</div>
	)
}

export default OwnerInfoDisplay
