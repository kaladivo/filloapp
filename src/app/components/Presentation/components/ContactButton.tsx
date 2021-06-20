import React, {useCallback, useState} from 'react'
import {Button} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import ContactFormOverlay from './ContactFormOverlay'

function ContactButton({className}: {className?: string}) {
	const [open, setOpen] = useState(false)
	const {t} = useTranslation()

	const onClick = useCallback(() => {
		setOpen(true)
	}, [])
	return (
		<>
			<Button
				className={className}
				onClick={onClick}
				size="large"
				variant="contained"
				color="primary"
			>
				{t('Presentation.common.createAccount')}
			</Button>
			<ContactFormOverlay open={open} onOpen={setOpen} />
		</>
	)
}

export default ContactButton
