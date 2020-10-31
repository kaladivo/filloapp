import React, {useCallback, useContext} from 'react'
import {useAsync} from 'react-async'
import {useTranslation} from 'react-i18next'
import {Typography} from '@material-ui/core'
import {EnvInfo} from '../../constants/models/EnvInfo'
import {useApiService} from '../api/apiContext'

type EnvInfoStatus = 'loading' | 'done'

interface EnvInfoContext {
	envInfo: EnvInfo
	envInfoStatus: EnvInfoStatus
}

const emptyContextValue: EnvInfoContext = {
	envInfo: {
		googleClientId: '',
		googlePickerDeveloperKey: '',
		googleScopes: '',
		googleSharingServiceAccount: '',
		googleAppId: '',
	},
	envInfoStatus: 'loading',
}

const envInfoContext = React.createContext<EnvInfoContext>(emptyContextValue)

function EnvInfoProvider({children}: {children: React.ReactNode}) {
	const api = useApiService()
	const fetchEnvInfoTask = useAsync({
		promiseFn: useCallback(async () => {
			const response = await api.envInfo.getEnvInfo()
			return response.data
		}, [api]),
	})

	return (
		<envInfoContext.Provider
			value={{
				envInfo: fetchEnvInfoTask.data || emptyContextValue.envInfo,
				envInfoStatus: fetchEnvInfoTask.isFulfilled ? 'done' : 'loading',
			}}
		>
			{children}
		</envInfoContext.Provider>
	)
}

export function useEnvInfo(): EnvInfo {
	// TODO Report error if accessed before env info is fetched
	return useContext(envInfoContext).envInfo
}

export function useEnvInfoStatus(): EnvInfoStatus {
	return useContext(envInfoContext).envInfoStatus
}

export function WaitForEnvInfo({children}: {children: React.ReactNode}) {
	const {t} = useTranslation()
	const status = useEnvInfoStatus()

	if (status === 'loading') {
		return <Typography>{t('common.loading')}</Typography>
	}

	return <>{children}</>
}

export default EnvInfoProvider
