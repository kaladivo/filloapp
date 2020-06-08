import React, {useCallback} from 'react'
import {useAsync} from 'react-async'
import {useParams} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {useApiService} from '../../api/apiContext'
import RootContainer from '../RootContainer'
import RetryableError from '../RetryableError'
import LoadingIndicator from '../LoadingIndicator'
import SubmitFlow from './components/SubmitFlow'
import BackBreadcrumb from '../BackBreadcrumb'

function SubmitBlueprintsGroupScreen() {
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
			<BackBreadcrumb
				to={`/blueprints-group/${id}`}
				text={t(`common.goBack`)}
			/>
			{fetchDetailTask.isLoading && <LoadingIndicator text="Loading detail" />}
			{fetchDetailTask.isRejected && fetchDetailTask.error && (
				<RetryableError
					text="Unable to fetch blueprint"
					error={fetchDetailTask.error}
					onTryAgain={fetchDetailTask.reload}
				/>
			)}
			{fetchDetailTask.data && fetchDetailTask.isResolved && (
				<SubmitFlow blueprintsGroup={fetchDetailTask.data} />
			)}
		</RootContainer>
	)
}

export default SubmitBlueprintsGroupScreen
