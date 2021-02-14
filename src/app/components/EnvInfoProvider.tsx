import React, {useCallback, useContext, useMemo} from 'react'
import {useAsync} from 'react-async'
import {useTranslation} from 'react-i18next'
import {Typography} from '@material-ui/core'
import {EnvInfo} from '../../constants/models/EnvInfo'
import {ApiService} from '../api'

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
	// TODO Report error if accessed before env info is fetched
	return useContext(envInfoContext).envInfo
}

export default EnvInfoProvider
