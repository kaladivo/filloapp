import React, {useCallback} from 'react'
import {Typography} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {useAsync} from 'react-async'
import {useHistory} from 'react-router-dom'
import Markdown from 'react-markdown'
import RootContainer from '../RootContainer'
import DriveFilePickerButton from '../DriveFilePickerButton'
import {useApiService} from '../../api/apiContext'
import LoadingIndicator from '../LoadingIndicator'
import RetryableError from '../RetryableError'

function CreateBlueprintScreen() {
	const {t} = useTranslation()
	const api = useApiService()
	const history = useHistory()

	const createBlueprintTask = useAsync({
		deferFn: useCallback(
			async ([document]: any) => {
				const {id} = document[0]
				const response = await api.blueprints.create({
					fileId: id,
					isSubmitted: false,
					fieldsOptions: [],
				})

				history.push(`/blueprints/${response.data.id}/edit`)
			},
			[api, history]
		),
	})

	return (
		<RootContainer>
			<Typography variant="h4">{t('CreateBlueprintScreen.title')}</Typography>
			<Typography>
				<Markdown>{t('CreateBlueprintScreen.textMd')}</Markdown>
			</Typography>
			{createBlueprintTask.isRejected && createBlueprintTask.error && (
				<RetryableError
					error={createBlueprintTask.error}
					onTryAgain={createBlueprintTask.reload}
					text={t('CreateBlueprintScreen.error')}
				/>
			)}
			{!createBlueprintTask.isLoading && (
				<DriveFilePickerButton
					pickerTitle={t('CreateBlueprintScreen.pickerTitle')}
					pickerMode="documents"
					onSelected={createBlueprintTask.run}
					label={t('CreateBlueprintScreen.pickerLabel')}
					color="primary"
					variant="contained"
				/>
			)}
			{createBlueprintTask.isLoading && (
				<LoadingIndicator text={t('common.loading')} />
			)}
		</RootContainer>
	)
}

export default CreateBlueprintScreen
