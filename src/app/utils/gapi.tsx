import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Typography} from '@material-ui/core'

const CLIENT_ID = String(process.env.REACT_APP_GOOGLE_CLIENT_ID)
const SCOPES = String(process.env.REACT_APP_GOOGLE_SCOPES)

function GapiProvider({children}: {children: React.ReactNode}) {
	const {t} = useTranslation()
	const [loaded, setLoaded] = useState(false)
	useEffect(() => {
		// TODO use gapi from index
		// @ts-ignore
		const {gapi} = window
		gapi.load('auth2:picker', () => {
			gapi.client.init({clientId: CLIENT_ID, scope: SCOPES}).then(() => {
				setLoaded(true)
			})
		})
	}, [])

	if (loaded) return <>{children}</>
	return <Typography>{t('common.loading')}</Typography>
}

export {GapiProvider}