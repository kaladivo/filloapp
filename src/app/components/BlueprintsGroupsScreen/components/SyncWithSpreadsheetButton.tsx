import React from 'react'
import {Button, CircularProgress} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {useAsync} from 'react-async'
import {useSnackbar} from 'notistack'
import {useApiService} from '../../../api/apiContext'
import {useCustomerInfo} from '../../CustomerInfoProvider'

function SyncWithSpreadsheetButton() {
	const {t} = useTranslation()
	const api = useApiService()
	const {enqueueSnackbar} = useSnackbar()
	const customerInfo = useCustomerInfo()

	const syncTask = useAsync({
		deferFn: api.blueprintsGroups.triggerSpreadsheetExport,
		onResolve: () => {
			enqueueSnackbar(t('CDSpecific.syncWithSpreadsheetSuccess'), {
				variant: 'success',
			})
		},
		onReject: () => {
			enqueueSnackbar(t('CDSpecific.syncWithSpreadsheetError'), {
				variant: 'error',
			})
		},
	})

	if (!customerInfo.spreadsheetExport) return null

	return (
		<Button
			variant="outlined"
			color="primary"
			disabled={syncTask.isLoading}
			onClick={syncTask.run}
		>
			{t('CDSpecific.syncWithSpreadsheet')}{' '}
			{syncTask.isLoading && <CircularProgress />}
		</Button>
	)
}

export default SyncWithSpreadsheetButton
