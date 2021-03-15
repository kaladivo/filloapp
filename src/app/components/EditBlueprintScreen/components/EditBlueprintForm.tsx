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
import AreYouSureDialog from '../../AreYouSureDialog'

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {},
		fields: {
			// margin: theme.spacing(0, 0, -2, 0),
			// '& > *': {
			// 	margin: theme.spacing(2, 0),
			// },
		},
		buttonsContainer: {
			margin: theme.spacing(2, -1, 0),
			' & > *': {
				display: 'inline-block',
				margin: theme.spacing(0, 1),
			},
		},
		addNewButton: {
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
	const [deleteDialogOpen, setDeleteDialogOpen] = useState()

	const classes = useStyles()
	const [blueprint, setBlueprint] = useState(initialBlueprint)
	const [expandedBlueprints, setExpandedBlueprints] = useState<{
		[id: string]: boolean
	}>({})

	const submitTask = useAsync({
		deferFn: useCallback(async () => {
			await api.blueprints.update({
				name: blueprint.name,
				blueprintId: blueprint.id,
				fieldsOptions: blueprint.fields,
			})

			enqueueSnackbar(t(t('EditBlueprintScreen.updateSuccess')), {
				variant: 'success',
			})
			history.push('/blueprints')
		}, [blueprint, api, history, enqueueSnackbar, t]),
	})

	const deleteTask = useAsync({
		deferFn: useCallback(async () => {
			await api.blueprints.delete({blueprintId: blueprint.id})

			enqueueSnackbar(t('EditBlueprintScreen.deleteSuccess'), {
				variant: 'success',
			})
			history.push('/blueprints')
		}, [api, blueprint, enqueueSnackbar, t, history]),
	})

	// When error while updating
	useEffect(() => {
		if (!submitTask.isRejected || !submitTask.error) return
		enqueueSnackbar(t(t('EditBlueprintScreen.updateError')), {variant: 'error'})
		// TODO report
	}, [submitTask.isRejected, submitTask.error, enqueueSnackbar, t])

	// When error while deleting
	useEffect(() => {
		if (!deleteTask.isRejected || !deleteTask.error) return
		enqueueSnackbar(t(t('EditBlueprintScreen.deleteError')), {variant: 'error'})
		// TODO report
	}, [deleteTask.error, enqueueSnackbar, t, deleteTask.isRejected])

	const onSubmit = useCallback(
		(e) => {
			e.preventDefault()
			submitTask.run()
		},
		[submitTask]
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
			<AreYouSureDialog
				contentText={t('EditBlueprintScreen.deleteDialogContent')}
				positiveText={t('common.delete')}
				negativeText={t('common.cancel')}
				open={deleteDialogOpen}
				setOpen={setDeleteDialogOpen}
				titleText={t('EditBlueprintScreen.deleteDialogTitle')}
				onPositiveClicked={deleteTask.run}
			/>
			<Typography variant="h4">{t('EditBlueprintScreen.title')}</Typography>
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
				margin="normal"
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
			<div>
				<Button
					className={classes.addNewButton}
					onClick={handleAddNewField}
					variant="outlined"
					color="primary"
				>
					{t('EditBlueprintScreen.addNewField')}
				</Button>
			</div>
			<div className={classes.buttonsContainer}>
				<Button
					disabled={submitTask.isLoading}
					type="submit"
					color="primary"
					variant="contained"
				>
					{submitTask.isLoading ? <CircularProgress /> : t('common.submit')}
				</Button>
				<Button
					onClick={() => setDeleteDialogOpen(true)}
					disabled={deleteTask.isLoading}
					variant="contained"
				>
					{deleteTask.isLoading ? <CircularProgress /> : t('common.delete')}
				</Button>
			</div>
		</form>
	)
}

export default EditBlueprintForm
