import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Typography} from '@material-ui/core'
import {useEnvInfo, useEnvInfoStatus} from '../components/EnvInfoProvider'

function GapiProvider({children}: {children: React.ReactNode}) {
	const {t} = useTranslation()
	const [loaded, setLoaded] = useState(false)
	const {googleClientId, googleScopes} = useEnvInfo()
	const envInfoStatus = useEnvInfoStatus()
	useEffect(() => {
		// TODO use gapi from index
		if (envInfoStatus === 'loading') return
		// @ts-ignore
		const {gapi} = window
		gapi.load('auth2:picker', () => {
			gapi.client
				.init({clientId: googleClientId, scope: googleScopes})
				.then(() => {
					setLoaded(true)
				})
		})
	}, [googleClientId, googleScopes, envInfoStatus])

	if (loaded) return <>{children}</>
	return <Typography>{t('common.loading')}</Typography>
}

export {GapiProvider}
