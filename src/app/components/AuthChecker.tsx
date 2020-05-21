import {memo, useEffect, useCallback} from 'react'
import {useSnackbar} from 'notistack'
import {cleanUser, getUser, User} from '../utils/auth'
import apiService from '../api'

async function refreshUser(): Promise<User | null> {
	try {
		const validateUserResponse = await apiService.auth.checkUser({
			bearer: getUser().accessToken,
		})

		return validateUserResponse.data
	} catch (e) {
		if (e?.response?.status === 401 || e?.response?.status === 403) {
			return null
		}
		throw e
	}
}

function AuthChecker() {
	const snackbar = useSnackbar()
	const checkAuth = useCallback(() => {
		refreshUser()
			.then((user) => {
				if (!user) cleanUser()
			})
			.catch((e) => {
				snackbar.enqueueSnackbar(
					'Nelze ověřit správnost uživatele. Pokud se vyskytnout problémy. Odhlašte a přihlašte se.',
					{variant: 'warning'}
				)
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

export default memo(AuthChecker)
