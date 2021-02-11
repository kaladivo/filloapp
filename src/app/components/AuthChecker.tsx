import {useEffect, useCallback} from 'react'
import {useSnackbar} from 'notistack'
import {useTranslation} from 'react-i18next'
import {cleanUser, getUser, User} from '../utils/auth'
import {ApiService} from '../api'
import {useApiService} from '../api/apiContext'

async function checkUser(
	user: User | null,
	apiService: ApiService
): Promise<boolean> {
	if (!user) return false
	try {
		await apiService.auth.checkUser({bearer: user.accessToken})
		return true
	} catch (e) {
		if (e.response?.status === 401) {
			return false
		}
		throw e
	}
}

function AuthChecker() {
	const snackbar = useSnackbar()
	const {t} = useTranslation()
	const api = useApiService()
	const checkAuth = useCallback(() => {
		checkUser(getUser(), api)
			.then((valid) => {
				if (!valid) cleanUser() // TODO try to refresh
			})
			.catch((e) => {
				snackbar.enqueueSnackbar(t('AuthChecker.unableToCheckUser'), {
					variant: 'warning',
				})
				console.warn('Error while refreshing user', e)
			})
	}, [snackbar])
	useEffect(() => {
		checkAuth()
		const intervalId = setInterval(checkAuth, 60000)
		return () => clearInterval(intervalId)
	}, [checkAuth])
	return null
}

export default AuthChecker
