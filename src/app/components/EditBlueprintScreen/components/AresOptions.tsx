import React from 'react'
import {createStyles, makeStyles, TextField} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {
	Blueprint,
	BlueprintFieldOptions,
} from '../../../../constants/models/Blueprint'

const useStyles = makeStyles(() =>
	createStyles({
		root: {},
	})
)

interface Props {
	className?: string
	options: BlueprintFieldOptions
	onChange: (value: BlueprintFieldOptions) => void
	blueprint: Blueprint
}

function AresOptions({options, onChange, className}: Props) {
	const classes = useStyles()
	const {t} = useTranslation()

	const handleChange = (name: string) => (e: any) => {
		const value = e.target.value || undefined
		onChange({...options, [name]: value})
	}

	return (
		<div className={`${classes.root} ${className}`}>
			<TextField
				margin="normal"
				fullWidth
				onChange={handleChange('nameTarget')}
				value={options.nameTarget || ''}
				label={t('EditBlueprintScreen.ares.name')}
				helperText={t('EditBlueprintScreen.ares.helperText')}
			/>
			<TextField
				margin="normal"
				fullWidth
				onChange={handleChange('obecTarget')}
				value={options.obecTarget || ''}
				label={t('EditBlueprintScreen.ares.obec')}
				helperText={t('EditBlueprintScreen.ares.helperText')}
			/>
			<TextField
				margin="normal"
				fullWidth
				onChange={handleChange('streetTarget')}
				value={options.streetTarget || ''}
				label={t('EditBlueprintScreen.ares.street')}
				helperText={t('EditBlueprintScreen.ares.helperText')}
			/>
			<TextField
				margin="normal"
				fullWidth
				onChange={handleChange('okresTarget')}
				value={options.okresTarget || ''}
				label={t('EditBlueprintScreen.ares.okres')}
				helperText={t('EditBlueprintScreen.ares.helperText')}
			/>
			<TextField
				margin="normal"
				fullWidth
				onChange={handleChange('castObceTarget')}
				value={options.castObceTarget || ''}
				label={t('EditBlueprintScreen.ares.castObce')}
				helperText={t('EditBlueprintScreen.ares.helperText')}
			/>
			<TextField
				margin="normal"
				fullWidth
				onChange={handleChange('mestskaCastTarget')}
				value={options.mestskaCastTarget || ''}
				label={t('EditBlueprintScreen.ares.mestskaCast')}
				helperText={t('EditBlueprintScreen.ares.helperText')}
			/>
			<TextField
				margin="normal"
				fullWidth
				onChange={handleChange('domovniTarget')}
				value={options.domovniTarget || ''}
				label={t('EditBlueprintScreen.ares.domovni')}
				helperText={t('EditBlueprintScreen.ares.helperText')}
			/>
			<TextField
				margin="normal"
				fullWidth
				onChange={handleChange('orientacniTarget')}
				value={options.orientacniTarget || ''}
				label={t('EditBlueprintScreen.ares.orientacni')}
				helperText={t('EditBlueprintScreen.ares.helperText')}
			/>
			<TextField
				margin="normal"
				fullWidth
				onChange={handleChange('dicTarget')}
				value={options.dicTarget || ''}
				label={t('EditBlueprintScreen.ares.dic')}
				helperText={t('EditBlueprintScreen.ares.helperText')}
			/>
			<TextField
				margin="normal"
				fullWidth
				onChange={handleChange('pscTarget')}
				value={options.pscTarget || ''}
				label={t('EditBlueprintScreen.ares.psc')}
				helperText={t('EditBlueprintScreen.ares.helperText')}
			/>
		</div>
	)
}

export default AresOptions
