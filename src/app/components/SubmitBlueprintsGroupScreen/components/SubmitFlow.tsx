import React, {useState, useMemo, useCallback} from 'react'
import {Typography} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {useAsync} from 'react-async'
import {BlueprintGroup} from '../../../../constants/models/BlueprintsGroup'
import FillValuesScreen from './FillValuesScreen'
import SettingsScreen, {SettingsValues} from './SettingsScreen'
import {useApiService} from '../../../api/apiContext'

interface Props {
	blueprintsGroup: BlueprintGroup
}

function SubmitFlow({blueprintsGroup}: Props) {
	const {t} = useTranslation()
	const [step, setStep] = useState<'values' | 'settings'>('values')
	const api = useApiService()

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
		outputFolder: null,
		name: '',
	})

	console.log(settings)

	const submitDetailTask = useAsync({
		deferFn: useCallback(async () => {
			const valuesToSubmit = Object.keys(values).reduce<{
				[key: string]: {type: string; value: string}
			}>((prev, key) => {
				if (!values[key]) return prev
				return {
					...prev,
					[key]: {
						type: 'string',
						value: values[key],
					},
				}
			}, {})

			const settingsToSubmit = {
				outputName: settings.name,
				generatePdfs: settings.generatePdfs,
				generateMasterPdf: false,
				outputFolderId: settings.outputFolder?.id || '',
			}

			console.log('submitting', valuesToSubmit, {settings})

			api.blueprintsGroups.submit({
				id: blueprintsGroup.id,
				data: {values: valuesToSubmit, settings: settingsToSubmit},
			})
		}, [values, settings]),
	})

	return (
		<>
			<Typography variant="h5">
				{t('SubmitBlueprintsGroupScreen.fillValues', {
					name: blueprintsGroup.name,
				})}
			</Typography>
			{step === 'values' && (
				<FillValuesScreen
					fields={blueprintsGroup.fields}
					values={values}
					onChange={setValues}
					onSubmit={() => {
						setStep('settings')
					}}
				/>
			)}
			{step === 'settings' && (
				<SettingsScreen
					values={settings}
					onChange={(vals) => {
						console.log('aha', vals)
						setSettings(vals)
					}}
					onNext={submitDetailTask.run}
				/>
			)}
		</>
	)
}

export default SubmitFlow
