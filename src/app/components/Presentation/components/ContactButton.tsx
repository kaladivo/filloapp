import React, {useCallback, useState} from 'react'
import {
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
} from '@material-ui/core'
import {useTranslation} from 'react-i18next'

function ContactButton({className}: {className?: string}) {
	const [open, setOpen] = useState(false)
	const {t} = useTranslation()

	const handleClose = useCallback(() => {
		setOpen(false)
		window.open(t('Presentation.createAccountDialog.mailLink'), '_blank')
	}, [t])

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

			<Dialog
				open={open}
				onClose={handleClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogTitle id="alert-dialog-title">
					{t('Presentation.createAccountDialog.title')}
				</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						{t('Presentation.createAccountDialog.text')}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color="primary">
						{t('Presentation.createAccountDialog.no')}
					</Button>
					<Button onClick={handleClose} color="primary" autoFocus>
						{t('Presentation.createAccountDialog.yes')}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	)
}

export default ContactButton
