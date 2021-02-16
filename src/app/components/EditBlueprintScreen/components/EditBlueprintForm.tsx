import React, {useCallback, useState} from 'react'
import {
	createStyles,
	makeStyles,
	TextField,
	Typography,
	Button,
} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {
	Blueprint,
	BlueprintField as BlueprintFieldI,
} from '../../../../constants/models/Blueprint'
import BlueprintField from './BlueprintField'

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {},
		fields: {
			// margin: theme.spacing(0, 0, -2, 0),
			// '& > *': {
			// 	margin: theme.spacing(2, 0),
			// },
		},
		submitButton: {
			marginTop: theme.spacing(2),
		},
	})
)

function EditBlueprintForm({
	blueprint: initialBlueprint,
}: {
	blueprint: Blueprint
}) {
	const {t} = useTranslation()
	const classes = useStyles()
	const [blueprint, setBlueprint] = useState(initialBlueprint)
	const [expandedBlueprints, setExpandedBlueprints] = useState<{
		[id: string]: boolean
	}>({})

	const onSubmit = useCallback(
		(e) => {
			e.preventDefault()
			console.log('Submitting', blueprint)
		},
		[blueprint]
	)

	const onExpand = useCallback(
		(expand: boolean, {id}: BlueprintFieldI) => {
			setExpandedBlueprints((old) => ({...old, [id]: expand}))
		},
		[setExpandedBlueprints]
	)

	const onFieldChange = useCallback(
		(changedField: BlueprintFieldI) => {
			setBlueprint((old) => {
				const index = old.fields.findIndex((one) => one.id === changedField.id)
				if (index === -1) return old

				const newFields = [...old.fields]
				newFields[index] = changedField
				return {...old, fields: newFields}
			})
		},
		[setBlueprint]
	)

	// TODO display owner
	// TODO display if it is submitted or not
	// TODO display google doc
	return (
		<form onSubmit={onSubmit}>
			<TextField
				fullWidth
				label={t('EditBlueprintScreen.blueprintNameLabel')}
				helperText={t('EditBlueprintScreen.blueprintNameHelper')}
				onChange={(e) => {
					const {value} = e.target
					setBlueprint((old) => ({
						...old,
						name: value,
					}))
				}}
				value={blueprint.name}
			/>

			<Typography variant="h5">{t('EditBlueprintScreen.fields')}</Typography>
			<div className={classes.fields}>
				{blueprint.fields.map((field) => (
					<BlueprintField
						key={field.id}
						expanded={expandedBlueprints[field.id]}
						onExpand={onExpand}
						value={field}
						onChange={onFieldChange}
					/>
				))}
			</div>
			<Button
				className={classes.submitButton}
				type="submit"
				color="primary"
				variant="contained"
			>
				{t('common.submit')}
			</Button>
		</form>
	)
}

export default EditBlueprintForm
