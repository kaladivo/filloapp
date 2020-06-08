import React, {useCallback} from 'react'
import {useParams} from 'react-router-dom'
import {useAsync} from 'react-async'
import {useTranslation} from 'react-i18next'
import {useApiService} from '../../api/apiContext'
import RootContainer from '../RootContainer'
import LoadingIndicator from '../LoadingIndicator'
import RetryableError from '../RetryableError'
import BlueprintsGroupDetail from './components/BlueprintsGroupDetail'
import BackBreadcrumb from '../BackBreadcrumb'

function BlueprintsGroupDetailScreen() {
	const {id} = useParams()
	const api = useApiService()
	const {t} = useTranslation()

	const fetchDetailTask = useAsync({
		promiseFn: useCallback(async () => {
			const detailData = await api.blueprintsGroups.get({id})
			return detailData.data
		}, [id, api]),
	})

	return (
		<RootContainer>
			{!fetchDetailTask.isFulfilled && (
				<BackBreadcrumb to="/" text={t('common.goBack')} />
			)}
			{fetchDetailTask.isLoading && <LoadingIndicator text="Loading detail" />}
			{fetchDetailTask.isRejected && fetchDetailTask.error && (
				<RetryableError
					text="Unable to fetch blueprint"
					error={fetchDetailTask.error}
					onTryAgain={fetchDetailTask.reload}
				/>
			)}
			{fetchDetailTask.data && fetchDetailTask.isResolved && (
				<BlueprintsGroupDetail blueprintsGroup={fetchDetailTask.data} />
			)}
		</RootContainer>
	)
}

export default BlueprintsGroupDetailScreen
