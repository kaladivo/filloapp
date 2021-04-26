import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {Typography} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {useAsync} from 'react-async'
import {useHistory} from 'react-router-dom'
import {useSnackbar} from 'notistack'
import moment from 'moment'
import {
	BlueprintGroup,
	SubmitSettings,
	GroupField,
} from '../../../../constants/models/BlueprintsGroup'
import FillValuesScreen from './FillValuesScreen'
import SettingsScreen, {SubmitSettingsState} from './SettingsScreen'
import {useApiService} from '../../../api/apiContext'
import LoadingIndicator from '../../LoadingIndicator'
import ErrorScreen from './ErrorScreen'
import {useCustomerInfo} from '../../CustomerInfoProvider'
import {getDateFormatForSetting} from '../../BlueprintField/components/DateField'
import {BlueprintField} from '../../../../constants/models/Blueprint'

interface Props {
	blueprintsGroup: BlueprintGroup
}

function getBlueprintField(field: GroupField): BlueprintField {
	// TODO let user select
	const firstNonString = field.fieldsProperties.find(
		(one) => one.type !== 'string'
	)
	if (firstNonString) return firstNonString

	return field.fieldsProperties[0]
}

function SubmitFlow({blueprintsGroup}: Props) {
	const {t} = useTranslation()
	const [step, setStep] = useState<'values' | 'settings' | 'loading' | 'error'>(
		'values'
	)
	const api = useApiService()
	const history = useHistory()
	const {enqueueSnackbar} = useSnackbar()
	const customerInfo = useCustomerInfo()

	const defaultValues = useMemo(() => {
		return blueprintsGroup.fields.reduce<{[key: string]: string}>(
			(prev, {name}) => {
				const lastSubmit = blueprintsGroup.submits[0]?.filledValues.find(
					(one) => one.name === name
				)?.value

				const field = blueprintsGroup.fields.find((one) => one.name === name)
				// TODO: sentry report to sentry
				if (!field) {
					console.warn('Field with that name not found')
					return prev
				}
				const properties = getBlueprintField(field)

				const {options, type} = properties

				// If there was no last submit and date field should be set to current
				if (!lastSubmit && type === 'date' && options.setNow) {
					return {
						...prev,
						[name]: moment().format(
							getDateFormatForSetting(!!options.withTime)
						),
					}
				}

				const specifiedDefaultValue = properties.defaultValue

				const defaultValue = lastSubmit || specifiedDefaultValue || ''

				return {
					...prev,
					[name]: defaultValue,
				}
			},
			{}
		)
	}, [blueprintsGroup])

	const [values, setValues] = useState(defaultValues)

	const defaultFolder = customerInfo.defaults?.submitSettings?.folder

	const [settings, setSettings] = useState<SubmitSettingsState>({
		generatePdfs: customerInfo.defaults?.submitSettings?.generatePdfs || false,
		outputFolder: defaultFolder || null,
		generateMasterPdf:
			customerInfo.defaults?.submitSettings?.generateMasterPdf || false,
	})

	const submitDetailTask = useAsync({
		deferFn: useCallback(async () => {
			const valuesToSubmit = Object.keys(values).reduce<{
				[key: string]: {type: string; value: string}
			}>((prev, key) => {
				const field = blueprintsGroup.fields.find((one) => one.name === key)
				if (!field) return prev
				const properties = getBlueprintField(field)

				const valueType = properties.type
				// if (!values[key] && valueType === 'string') return prev
				return {
					...prev,
					[key]: {
						type: valueType,
						// fallback to empty string
						value: values[key] || '',
					},
				}
			}, {})

			// TODO handle unauthorized errors!

			const settingsToSubmit: SubmitSettings = {
				generatePdfs: settings.generatePdfs,
				generateMasterPdf: settings.generateMasterPdf,
				outputFolder: {id: settings.outputFolder?.id || ''},
			}

			await api.blueprintsGroups.submit({
				id: blueprintsGroup.id,
				data: {values: valuesToSubmit, settings: settingsToSubmit},
			})
		}, [values, settings, blueprintsGroup, api]),
		onReject: useCallback(() => {
			setStep('error')
		}, [setStep]),
		onResolve: useCallback(() => {
			history.push(`/blueprints-group/${blueprintsGroup.id}`)
			enqueueSnackbar(t('SubmitBlueprintsGroupScreen.success'), {
				variant: 'success',
			})
		}, [history, blueprintsGroup, t, enqueueSnackbar]),
	})

	const onSubmit = useCallback(() => {
		setStep('loading')
		submitDetailTask.run()
	}, [submitDetailTask, setStep])

	useEffect(() => {
		if (step === 'error' && !submitDetailTask.isRejected) setStep('settings')
	}, [step, setStep, submitDetailTask])

	return (
		<>
			<Typography variant="h5">
				{t('SubmitBlueprintsGroupScreen.fillValues', {
					name: blueprintsGroup.name,
				})}
			</Typography>
			{step === 'values' && (
				<>
					<FillValuesScreen
						fields={blueprintsGroup.fields.map(getBlueprintField)}
						values={values}
						onChange={setValues}
						onSubmit={() => {
							setStep('settings')
						}}
					/>
				</>
			)}
			{step === 'settings' && (
				<SettingsScreen
					onBack={() => setStep('values')}
					values={settings}
					onChange={(vals) => {
						setSettings(vals)
					}}
					onNext={onSubmit}
				/>
			)}
			{step === 'loading' && (
				<LoadingIndicator text={t('SubmitBlueprintsGroupScreen.loading')} />
			)}
			{step === 'error' &&
				submitDetailTask.isRejected &&
				submitDetailTask.error && (
					<ErrorScreen
						error={submitDetailTask.error}
						onRetry={onSubmit}
						onGoBack={() => setStep('settings')}
					/>
				)}
		</>
	)
}

export default SubmitFlow
