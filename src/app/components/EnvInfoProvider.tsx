import React, {useCallback, useContext, useEffect, useMemo} from 'react'
import {useAsync} from 'react-async'
import {useTranslation} from 'react-i18next'
import {Typography} from '@material-ui/core'
import {EnvInfo} from '../../constants/models/EnvInfo'
import {ApiService} from '../api'
import sentry, {configureFromEnvInfo} from '../utils/sentry'

type EnvInfoStatus = 'loading' | 'done'

interface EnvInfoContext {
	envInfo: EnvInfo
}

const emptyContextValue: EnvInfoContext = {
	envInfo: {
		googleClientId: '',
		googlePickerDeveloperKey: '',
		googleScopes: '',
		googleSharingServiceAccount: '',
		googleAppId: '',
		version: '',
		environment: '',
	},
}

const envInfoContext = React.createContext<EnvInfoContext>(emptyContextValue)

function EnvInfoProvider({children}: {children: React.ReactNode}) {
	const {t} = useTranslation()
	const envInfoApi = useMemo(
		() =>
			new ApiService({getBearer: () => null, onBearerRefused: () => undefined})
				.envInfo,
		[]
	)

	const fetchEnvInfoTask = useAsync({
		promiseFn: useCallback(async () => {
			const response = await envInfoApi.getEnvInfo()
			return response.data
		}, [envInfoApi]),
	})

	useEffect(() => {
		const {data} = fetchEnvInfoTask
		if (data) {
			configureFromEnvInfo(data)
		}
	}, [fetchEnvInfoTask.data])

	if (!fetchEnvInfoTask.data) {
		return <Typography>{t('common.loading')} Env info</Typography>
	}

	return (
		<envInfoContext.Provider
			value={{
				envInfo: fetchEnvInfoTask.data || emptyContextValue.envInfo,
			}}
		>
			{children}
		</envInfoContext.Provider>
	)
}

export function useEnvInfo(): EnvInfo {
	const {envInfo} = useContext(envInfoContext)
	if (envInfo.googleAppId === '') {
		sentry.captureMessage('Env info accessed before it was set', {
			extra: {envInfo},
		})
	}
	return envInfo
}

export default EnvInfoProvider
