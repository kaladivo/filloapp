import React from 'react'
import {
	createStyles,
	IconButton,
	makeStyles,
	TextField,
} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {Delete} from '@material-ui/icons'
import {BlueprintField as BlueprintFieldI} from '../../../../constants/models/Blueprint'
import FieldTypeEdit from './FieldTypeEdit'

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {
			padding: theme.spacing(-2),
			width: '100%',
		},
		inner: {
			'& > *': {
				margin: theme.spacing(2, 0),
			},
		},
	})
)

interface Props {
	className?: string
	value: BlueprintFieldI
	onChange: (field: BlueprintFieldI) => void
	onDelete: (id: string) => void
}

function BlueprintFieldEdit({className, value, onChange, onDelete}: Props) {
	const classes = useStyles()
	const {t} = useTranslation()

	return (
		<div className={`${className} ${classes.root}`}>
			<TextField
				fullWidth
				label={t('EditBlueprintScreen.fieldTemplateNameLabel')}
				margin="normal"
				helperText={t('EditBlueprintScreen.fieldTemplateNameHelper')}
				value={value.name || ''}
				onChange={(e) => {
					onChange({...value, name: e.target.value})
				}}
			/>

			<TextField
				fullWidth
				margin="normal"
				label={t('EditBlueprintScreen.fieldDisplayNameLabel')}
				helperText={t('EditBlueprintScreen.fieldDisplayNameHelper')}
				value={value.displayName || ''}
				onChange={(e) => {
					onChange({...value, displayName: e.target.value})
				}}
			/>

			<TextField
				fullWidth
				margin="normal"
				label={t('EditBlueprintScreen.fieldHelperTextTitle')}
				helperText={t('EditBlueprintScreen.fieldHelperTextHelper')}
				value={value.helperText || ''}
				onChange={(e) => {
					onChange({...value, helperText: e.target.value})
				}}
			/>

			<FieldTypeEdit field={value} onChange={onChange} />
			<IconButton onClick={() => onDelete(value.id)}>
				<Delete />
			</IconButton>
		</div>
	)
}

export default BlueprintFieldEdit
