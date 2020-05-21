import React, {useState, useEffect} from 'react'
import {useAsync} from 'react-async'
import {Container} from '@material-ui/core'
import formFields, {FILES} from './constants/formFields'
import apiService from '../../api'
import {FormFile} from '../../api/forms/model'
import SelectFilesScreen from './components/SelectFilesScreen'
import FillValuesScreen from './components/FillValuesScreen'
import SuccessScreen from './components/SuccessScreen'
import TryAgainScreen from './components/TryAgainScreen'
import LoadingScreen from './components/LoadingScreen'

const defaultValues = Object.keys(formFields).reduce(
	(prev, key) => ({...prev, [key]: ''}),
	{}
)

async function submitData([data]: any): Promise<{url: string}> {
	if (data.files.length === 0)
		throw new Error('Vyberte alespoň jednu smlouvu k vygenerování.')
	const result = await apiService.forms.generateFilesFromData(data)

	return result.data
}

function SimpleForm() {
	const [checkedFiles, setCheckedFiles] = useState<FormFile[]>([])
	const [filledValues, setFilledValues] = useState<{[key: string]: string}>(
		defaultValues
	)
	const [step, setStep] = useState<
		'selectFiles' | 'fillValues' | 'loading' | 'error' | 'success'
	>('selectFiles')
	const {data: createdFile, error, isPending, run} = useAsync({
		deferFn: submitData,
		onResolve: () => {
			setCheckedFiles([])
			setFilledValues(defaultValues)
			setStep('success')
		},
	})

	useEffect(() => {
		if (step === 'loading' && !isPending) {
			if (error) setStep('error')
			else setStep('success')
		}
		if (step === 'success' && !createdFile) {
			setStep('selectFiles')
		}
	}, [isPending, setStep, step, error, createdFile])

	return (
		<Container maxWidth="md">
			{step === 'selectFiles' && (
				<SelectFilesScreen
					values={FILES}
					checkedFiles={checkedFiles}
					onChange={setCheckedFiles}
					onSubmit={() => {
						setCheckedFiles(checkedFiles)
						setStep('fillValues')
					}}
				/>
			)}
			{step === 'fillValues' && (
				<FillValuesScreen
					values={filledValues}
					onChange={setFilledValues}
					onGoBack={() => setStep('selectFiles')}
					formFields={formFields}
					onSubmit={() => {
						run({keyMap: filledValues, files: checkedFiles})
						setStep('loading')
					}}
				/>
			)}
			{step === 'loading' && <LoadingScreen />}
			{step === 'error' && (
				<TryAgainScreen
					tryAgain={() => {
						setStep('loading')
						run({keyMap: filledValues, files: checkedFiles})
					}}
					error={error}
					goBack={() => setStep('fillValues')}
				/>
			)}
			{step === 'success' && createdFile && (
				<SuccessScreen
					onGoBack={() => setStep('selectFiles')}
					resultUrl={createdFile.url}
				/>
			)}
		</Container>
	)
}

export default SimpleForm
