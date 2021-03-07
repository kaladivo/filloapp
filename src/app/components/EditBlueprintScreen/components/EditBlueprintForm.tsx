import React, {useCallback, useEffect, useState} from 'react'
import {
	Button,
	CircularProgress,
	createStyles,
	Link,
	makeStyles,
	TextField,
	Typography,
} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {useAsync} from 'react-async'
import {useSnackbar} from 'notistack'
import {useHistory} from 'react-router-dom'
import {
	Blueprint,
	BlueprintField as BlueprintFieldI,
} from '../../../../constants/models/Blueprint'
import BlueprintField from './BlueprintField'
import {useApiService} from '../../../api/apiContext'

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
	const api = useApiService()
	const {enqueueSnackbar} = useSnackbar()
	const history = useHistory()

	const classes = useStyles()
	const [blueprint, setBlueprint] = useState(initialBlueprint)
	const [expandedBlueprints, setExpandedBlueprints] = useState<{
		[id: string]: boolean
	}>({})

	const onSubmitTask = useAsync({
		deferFn: useCallback(async () => {
			await api.blueprints.upsert({
				fileId: blueprint.googleDocsId,
				fieldsOptions: blueprint.fields,
				isSubmitted: true,
			})
		}, [blueprint, api]),
	})

	// When updated
	useEffect(() => {
		if (!onSubmitTask.isResolved) return
		enqueueSnackbar('Blueprint successfully updated', {variant: 'success'})
		history.push('/blueprints')
	}, [onSubmitTask.isResolved, enqueueSnackbar, history])

	// When error while updating
	useEffect(() => {
		if (!onSubmitTask.isRejected || !onSubmitTask.error) return
		enqueueSnackbar('Error while updating blueprint', {variant: 'error'})
		// TODO report
	}, [onSubmitTask.isRejected, onSubmitTask.error, enqueueSnackbar])

	const onSubmit = useCallback(
		(e) => {
			e.preventDefault()
			onSubmitTask.run()
		},
		[onSubmitTask]
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

	const handleAddNewField = useCallback(() => {
		setBlueprint((prev) => ({
			...prev,
			fields: [
				...prev.fields,
				{
					id: Date.now().toString(),
					displayName: t('EditBlueprintScreen.newField.displayName'),
					helperText: t('EditBlueprintScreen.newField.helperText'),
					name: t('EditBlueprintScreen.newField.name'),
					type: 'string',
					options: {multiline: false},
				},
			],
		}))
	}, [setBlueprint, t])

	const handleDeleteField = useCallback(
		(id: string) => {
			setBlueprint((old) => {
				const fieldIndex = old.fields.findIndex((one) => one.id === id)
				if (fieldIndex === -1) return old
				const newFields = [...old.fields]
				newFields.splice(fieldIndex, 1)
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
			<Typography>
				{t('EditBlueprintScreen.ownedBy')} {blueprint.owner.info.name}
			</Typography>
			<Link
				href={`https://docs.google.com/document/d/${blueprint.googleDocsId}/edit`}
				target="_blank"
			>
				{t('EditBlueprintScreen.openFile')}
			</Link>
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
						onDelete={handleDeleteField}
						key={field.id}
						expanded={expandedBlueprints[field.id]}
						onExpand={onExpand}
						value={field}
						onChange={onFieldChange}
					/>
				))}
			</div>
			<Button onClick={handleAddNewField} variant="outlined" color="primary">
				{t('EditBlueprintScreen.addNewField')}
			</Button>
			<Button
				disabled={onSubmitTask.isLoading}
				className={classes.submitButton}
				type="submit"
				color="primary"
				variant="contained"
			>
				{onSubmitTask.isLoading ? <CircularProgress /> : t('common.submit')}
			</Button>
		</form>
	)
}

export default EditBlueprintForm
