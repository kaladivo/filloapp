import React, {useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {Typography} from '@material-ui/core'
import {useAsync} from 'react-async'
import RootContainer from '../../RootContainer'
import {useApiService} from '../../../api/apiContext'
import LoadingIndicator from '../../LoadingIndicator'
import CustomersList from './CustomersList'
import {parseTokenAndSetUser} from '../../../utils/auth'

function CustomerSelect({onSelected}: {onSelected: () => void}) {
	const {t} = useTranslation()
	const api = useApiService()

	const loadCustomersTask = useAsync({
		promiseFn: useCallback(async () => {
			const customers = await api.auth.listUserCustomers()
			return customers.data
		}, [api]),
	})

	const selectCustomerTask = useAsync({
		deferFn: useCallback(
			async ([customerId]) => {
				const response = await api.auth.selectCustomer({customerId})
				const {newBearer} = response.data

				parseTokenAndSetUser(newBearer)
				onSelected()
			},
			[api, onSelected]
		),
	})

	console.log({customers: loadCustomersTask.data})

	return (
		<RootContainer>
			<Typography variant="h3">{t('CustomerSelect.title')}</Typography>
			{loadCustomersTask.isLoading && (
				<LoadingIndicator text={t('CustomerSelect.loading')} />
			)}
			{loadCustomersTask.isResolved && loadCustomersTask.data && (
				<CustomersList
					customers={loadCustomersTask.data}
					onClick={(customer) => {
						selectCustomerTask.run(customer.customerId)
					}}
				/>
			)}
		</RootContainer>
	)
}

export default CustomerSelect
