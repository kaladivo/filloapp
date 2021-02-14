import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Typography} from '@material-ui/core'
import {useEnvInfo} from '../components/EnvInfoProvider'

function GapiProvider({children}: {children: React.ReactNode}) {
	const {t} = useTranslation()
	const [loaded, setLoaded] = useState(false)
	const {googleClientId, googleScopes} = useEnvInfo()

	useEffect(() => {
		// @ts-ignore
		const {gapi} = window

		gapi.load('auth2:picker', () => {
			gapi.client
				.init({clientId: googleClientId, scope: googleScopes})
				.then(() => {
					setLoaded(true)
				})
		})
	}, [googleClientId, googleScopes])

	if (loaded) return <>{children}</>
	return <Typography>{t('common.loading')} gapi</Typography>
}

export {GapiProvider}
