import React, {useCallback} from 'react'
import {useAsync} from 'react-async'
import {useParams} from 'react-router-dom'
import {useApiService} from '../../api/apiContext'
import RootContainer from '../RootContainer'
import RetryableError from '../RetryableError'
import LoadingIndicator from '../LoadingIndicator'
import SubmitFlow from './components/SubmitFlow'

function SubmitBlueprintsGroupScreen() {
	const {id} = useParams()
	const api = useApiService()

	const fetchDetailTask = useAsync({
		promiseFn: useCallback(async () => {
			const detailData = await api.blueprintsGroups.get({id})
			return detailData.data
		}, [id]),
	})

	return (
		<RootContainer>
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
