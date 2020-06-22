import React, {useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {useAsync} from 'react-async'
import {Button, CircularProgress} from '@material-ui/core'
import {useSnackbar} from 'notistack'
import {useHistory} from 'react-router-dom'
import {useApiService} from '../../../api/apiContext'

interface Props {
	className?: string
	blueprintsGroupId: string
}

function DeleteButton({className, blueprintsGroupId}: Props) {
	const {enqueueSnackbar} = useSnackbar()
	const {t} = useTranslation()
	const history = useHistory()
	const api = useApiService()

	const deleteTask = useAsync({
		deferFn: useCallback(() => {
			return api.blueprintsGroups.delete({id: blueprintsGroupId})
		}, [api, blueprintsGroupId]),
		onReject: useCallback(() => {
			enqueueSnackbar(t('BlueprintsGroupScreen.unableToDelete'), {
				variant: 'error',
			})
		}, [enqueueSnackbar, t]),
		onResolve: useCallback(() => {
			enqueueSnackbar(t('BlueprintsGroupScreen.deleted'), {variant: 'success'})
			history.push('/')
		}, [enqueueSnackbar, history, t]),
	})
	return (
		<Button
			className={className}
			variant="outlined"
			color="primary"
			onClick={deleteTask.run}
			disabled={deleteTask.isLoading}
		>
			{!deleteTask.isLoading ? (
				t('common.delete')
			) : (
				<CircularProgress size={20} />
			)}
		</Button>
	)
}

export default DeleteButton
