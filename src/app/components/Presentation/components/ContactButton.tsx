import React, {useCallback} from 'react'
import {Button} from '@material-ui/core'
import {useTranslation} from 'react-i18next'

function ContactButton({className}: {className?: string}) {
	const {t} = useTranslation()

	const onClick = useCallback(() => {
		alert('todo')
	}, [])
	return (
		<Button
			className={className}
			onClick={onClick}
			size="large"
			variant="contained"
			color="primary"
		>
			{t('Presentation.common.createAccount')}
		</Button>
	)
}

export default ContactButton
