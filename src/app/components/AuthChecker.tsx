import {useEffect, useCallback} from 'react'
import {useSnackbar} from 'notistack'
import {useTranslation} from 'react-i18next'
import {cleanUser, getUser, User} from '../utils/auth'
import apiService from '../api'

// async function refreshUser(): Promise<User | null> {
// 	try {
// 		const validateUserResponse = await apiService.auth.checkUser({
// 			bearer: getUser().accessToken,
// 		})

// 		return validateUserResponse.data
// 	} catch (e) {
// 		if (e?.response?.status === 401 || e?.response?.status === 403) {
// 			return null
// 		}
// 		throw e
// 	}
// }

async function checkUser(user: User): Promise<boolean> {
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
	const checkAuth = useCallback(() => {
		checkUser(getUser())
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
