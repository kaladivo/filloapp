import React, {useCallback, useEffect} from 'react'
import {
	Button,
	CircularProgress,
	createStyles,
	makeStyles,
	TextField,
} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {useAsync} from 'react-async'
import {useSnackbar} from 'notistack'
import {FieldProps} from '../../index'
import {useApiService} from '../../../../api/apiContext'

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {
			display: 'flex',
			alignItems: 'center',
		},
		field: {
			flexGrow: 1,
		},
		button: {
			maxWidth: theme.spacing(20),
			marginLeft: theme.spacing(1),
		},
	})
)

function AresField({className, field, value, onChange, allFields}: FieldProps) {
	const {t} = useTranslation()
	const api = useApiService()
	const classes = useStyles()
	const {enqueueSnackbar} = useSnackbar()

	const fetchTask = useAsync({
		deferFn: useCallback(async () => {
			const aresResponse = await api.ares.getByIco({ico: value})
			const {data} = aresResponse

			const {options} = field
			const nameField = allFields.find((one) => one.name === options.nameTarget)
			const obecField = allFields.find((one) => one.name === options.obecTarget)
			const streetField = allFields.find(
				(one) => one.name === options.streetTarget
			)
			const icoTarget = allFields.find((one) => one.name === options.icoTarget)
			const okresTarget = allFields.find(
				(one) => one.name === options.okresTarget
			)
			const castObceTarget = allFields.find(
				(one) => one.name === options.castObceTarget
			)
			const mestskaCastTarget = allFields.find(
				(one) => one.name === options.mestskaCastTarget
			)
			const streetTarget = allFields.find(
				(one) => one.name === options.streetTarget
			)
			const domovniTarget = allFields.find(
				(one) => one.name === options.domovniTarget
			)
			const orientacniTarget = allFields.find(
				(one) => one.name === options.orientacniTarget
			)
			const pscTarget = allFields.find((one) => one.name === options.pscTarget)

			if (obecField) onChange(String(data.obec), obecField)
			if (streetField) onChange(String(data.ulice), streetField)
			if (nameField) onChange(String(data.name), nameField)
			if (icoTarget) onChange(String(data.ico), icoTarget)
			if (okresTarget) onChange(String(data.okres), okresTarget)
			if (castObceTarget) onChange(String(data.castObce), castObceTarget)
			if (mestskaCastTarget)
				onChange(String(data.mestskaCast), mestskaCastTarget)
			if (streetTarget) onChange(String(data.ulice), streetTarget)
			if (domovniTarget) onChange(String(data.domovni), domovniTarget)
			if (orientacniTarget) onChange(String(data.orientacni), orientacniTarget)
			if (pscTarget) onChange(String(data.psc), pscTarget)
		}, [field, allFields, onChange, api]),
	})

	useEffect(() => {
		if (fetchTask.isRejected) {
			enqueueSnackbar(t('EditBlueprintScreen.ares.errorMessage'), {
				variant: 'error',
			})
		}
	}, [fetchTask.isRejected, enqueueSnackbar])

	return (
		<div className={`${className} ${classes.root}`}>
			<TextField
				className={classes.field}
				fullWidth
				label={field.displayName}
				helperText={field.helperText}
				value={value}
				onChange={(e) => onChange(e.target.value, field)}
			/>
			<Button
				className={classes.button}
				fullWidth
				variant="outlined"
				color="primary"
				onClick={fetchTask.run}
				disabled={fetchTask.isLoading}
			>
				{fetchTask.isLoading ? <CircularProgress /> : t('common.submit')}
			</Button>
		</div>
	)
}

export default AresField
