import React, {useState, useMemo, useCallback, useEffect} from 'react'
import {Typography} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {useAsync} from 'react-async'
import {useHistory} from 'react-router-dom'
import {useSnackbar} from 'notistack'
import {BlueprintGroup} from '../../../../constants/models/BlueprintsGroup'
import FillValuesScreenCD from './FillValuesScreenCD'
import SettingsScreen, {SettingsValues} from './SettingsScreen'
import {useApiService} from '../../../api/apiContext'
import LoadingIndicator from '../../LoadingIndicator'
import ErrorScreen from './ErrorScreen'
import {SubmitSettings} from '../../../api/BlueprintsGroups/models'

interface Props {
	blueprintsGroup: BlueprintGroup
}

function SubmitFlow({blueprintsGroup}: Props) {
	const {t} = useTranslation()
	const [step, setStep] = useState<'values' | 'settings' | 'loading' | 'error'>(
		'values'
	)
	const api = useApiService()
	const history = useHistory()
	const {enqueueSnackbar} = useSnackbar()

	const defaultValues = useMemo(() => {
		return blueprintsGroup.fields.reduce<{[key: string]: string}>(
			(prev, {name}) => {
				return {
					...prev,
					[name]:
						blueprintsGroup.submits[0]?.filledValues.find(
							(one) => one.name === name
						)?.value || '',
				}
			},
			{}
		)
	}, [blueprintsGroup])

	const [values, setValues] = useState(defaultValues)
	const [settings, setSettings] = useState<SettingsValues>({
		generatePdfs: true,
		removeOldVersion: true,
		outputFolder:
			blueprintsGroup.submits.length > 0
				? blueprintsGroup.submits[0]?.folder || null
				: null,
		generateDocuments: false,
		generateMasterPdf: false,
		name: '',
	})

	const submitDetailTask = useAsync({
		deferFn: useCallback(async () => {
			const valuesToSubmit = Object.keys(values).reduce<{
				[key: string]: {type: string; value: string}
			}>((prev, key) => {
				const valueType =
					// TODO let user select
					blueprintsGroup.fields.find((one) => one.name === key)?.types[0] ||
					'string'
				if (!values[key] && valueType === 'string') return prev
				return {
					...prev,
					[key]: {
						type: valueType,
						value: values[key],
					},
				}
			}, {})

			// TODO handle unauthorized errors!

			const settingsToSubmit: SubmitSettings = {
				outputName: settings.name,
				generatePdfs: settings.generatePdfs,
				generateDocuments: settings.generateDocuments,
				generateMasterPdf: false,
				outputFolder: {id: settings.outputFolder?.id || ''},
				removeOldVersion: settings.removeOldVersion,
			}

			console.log({settingsToSubmit, settings})

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
					<FillValuesScreenCD
						fields={blueprintsGroup.fields}
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
