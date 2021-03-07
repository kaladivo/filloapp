import React, {useCallback} from 'react'
import {useParams} from 'react-router-dom'
import {useAsync} from 'react-async'
import {useTranslation} from 'react-i18next'
import {useApiService} from '../../api/apiContext'
import RootContainer from '../RootContainer'
import LoadingIndicator from '../LoadingIndicator'
import RetryableError from '../RetryableError'
import EditBlueprintForm from './components/EditBlueprintForm'

function EditBlueprintScreen() {
	const {id} = useParams()
	const api = useApiService()
	const {t} = useTranslation()

	const loadBlueprintTask = useAsync({
		promiseFn: useCallback(async () => {
			const result = await api.blueprints.get({blueprintId: id})
			return result.data
		}, [id, api]),
	})

	return (
		<RootContainer>
			{loadBlueprintTask.isLoading && (
				<LoadingIndicator text={t('EditBlueprintScreen.loading')} />
			)}
			{loadBlueprintTask.isRejected && loadBlueprintTask.error && (
				<RetryableError
					onTryAgain={loadBlueprintTask.reload}
					text={t('EditBlueprintScreen.errorLoadingBlueprint')}
					error={loadBlueprintTask.error}
				/>
			)}
			{loadBlueprintTask.isResolved && loadBlueprintTask.data && (
				<EditBlueprintForm blueprint={loadBlueprintTask.data} />
			)}
		</RootContainer>
	)
}

export default EditBlueprintScreen
