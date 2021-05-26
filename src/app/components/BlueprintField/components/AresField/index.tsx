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
import {AresResponse} from '../../../../api/Ares'

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

function toStringOrEmpty(value: any) {
	return value ? String(value) : ''
}

function getLongAddress(data: AresResponse) {
	let addressString = `${toStringOrEmpty(data.ulice || data.obec)}`

	if (data.domovni && data.orientacni)
		addressString += ` ${data.domovni}/${data.orientacni}`
	if (data.domovni) addressString += ` ${data.domovni}`
	if (data.orientacni) addressString += ` ${data.orientacni}`

	addressString += `, ${data.psc}`
	if (data.mestskaCast) addressString += ` ${data.mestskaCast}`
	if (data.mestskaCast && data.castObce) addressString += ` -`
	if (data.castObce) addressString += ` ${data.castObce}`

	if (data.obec) addressString += `, ${data.obec}`

	return addressString
}

function AresField({className, field, value, onChange, allFields}: FieldProps) {
	const {t} = useTranslation()
	const api = useApiService()
	const classes = useStyles()
	const {enqueueSnackbar} = useSnackbar()

	const fillField = useCallback(
		({
			newValue,
			targetName,
		}: {
			newValue?: string | null
			targetName?: string | null
		}) => {
			const target = allFields.find((one) => one.name === targetName)
			const newValueString = toStringOrEmpty(newValue)
			if (target && newValueString) onChange(newValueString, target)
		},
		[onChange, allFields]
	)

	const fetchTask = useAsync({
		deferFn: useCallback(async () => {
			const aresResponse = await api.ares.getByIco({ico: value})
			const {data} = aresResponse

			const {options} = field

			fillField({newValue: data.name, targetName: options.nameTarget})
			fillField({newValue: data.obec, targetName: options.obecTarget})
			fillField({newValue: data.ulice, targetName: options.streetTarget})
			fillField({newValue: data.ico, targetName: options.icoTarget})
			fillField({newValue: data.okres, targetName: options.okresTarget})
			fillField({newValue: data.castObce, targetName: options.castObceTarget})
			fillField({
				newValue: data.mestskaCast,
				targetName: options.mestskaCastTarget,
			})
			fillField({newValue: data.domovni, targetName: options.domovniTarget})
			fillField({
				newValue: data.orientacni,
				targetName: options.orientacniTarget,
			})
			fillField({newValue: data.psc, targetName: options.pscTarget})
			fillField({newValue: data.dic, targetName: options.dicTarget})
			fillField({
				newValue: getLongAddress(data),
				targetName: options.longAddressTarget,
			})
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
