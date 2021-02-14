import React, {useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {createStyles, makeStyles, Typography, Paper} from '@material-ui/core'
import {useAsync} from 'react-async'
import RootContainer from '../../RootContainer'
import {useApiService} from '../../../api/apiContext'
import LoadingIndicator from '../../LoadingIndicator'
import CustomersList from './CustomersList'
import RetryableError from '../../RetryableError'
import {useSetBearer} from '../../AuthProvider'

const logo = require('../../../images/logo.png')

const useStyles = makeStyles((theme) =>
	createStyles({
		paper: {
			marginTop: theme.spacing(10),
			padding: theme.spacing(5),
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
		},
		logo: {
			maxWidth: theme.spacing(20),
			height: 'auto',
			margin: theme.spacing(2, 'auto'),
			display: 'block',
		},
		title: {
			marginBottom: theme.spacing(4),
		},
	})
)

function CustomerSelect({onSelected}: {onSelected: () => void}) {
	const {t} = useTranslation()
	const api = useApiService()
	const setBearer = useSetBearer()
	const classes = useStyles()

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
				setBearer(newBearer)
				onSelected()
			},
			[api, onSelected, setBearer]
		),
	})

	return (
		<RootContainer>
			<img alt="logo" className={classes.logo} src={logo} />
			<Paper className={classes.paper}>
				<Typography className={classes.title} align="center" variant="h3">
					{t('CustomerSelect.title')}
				</Typography>
				<Typography>{t('CustomerSelect.text')}</Typography>
				{loadCustomersTask.isLoading && (
					<LoadingIndicator text={t('CustomerSelect.loading')} />
				)}

				{selectCustomerTask.isLoading && (
					<LoadingIndicator text={t('CustomerSelect.selecting')} />
				)}
				{loadCustomersTask.isRejected && loadCustomersTask.error && (
					<RetryableError
						error={loadCustomersTask.error}
						onTryAgain={loadCustomersTask.reload}
					/>
				)}

				{selectCustomerTask.isRejected && selectCustomerTask.error && (
					<RetryableError
						error={selectCustomerTask.error}
						text={t('CustomerSelect.errorSelecting')}
					/>
				)}
				{loadCustomersTask.isResolved &&
					loadCustomersTask.data &&
					!selectCustomerTask.isLoading && (
						<CustomersList
							customers={loadCustomersTask.data}
							onClick={(customer) => {
								selectCustomerTask.run(customer.customerId)
							}}
						/>
					)}
			</Paper>
		</RootContainer>
	)
}

export default CustomerSelect
