import React, {createContext, useCallback, useContext} from 'react'
import {useAsync} from 'react-async'
import {Typography} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {CustomerInfo} from '../../constants/models/customerInfo'
import {useApiService} from '../api/apiContext'

const customerInfoContext = createContext<CustomerInfo>({})

function CustomerInfoProvider({children}: {children: React.ReactNode}) {
	const {t} = useTranslation()
	const api = useApiService()
	const asyncTask = useAsync({
		promiseFn: useCallback(async () => {
			const response = await api.customerInfo.getCustomerInfo()
			return response.data
		}, [api]),
	})

	if (asyncTask.isLoading) return <Typography>{t('common.loading')}</Typography>
	return (
		<customerInfoContext.Provider value={asyncTask.data || {}}>
			{children}
		</customerInfoContext.Provider>
	)
}

export function useCustomerInfo(): CustomerInfo {
	return useContext(customerInfoContext)
}

export default CustomerInfoProvider
