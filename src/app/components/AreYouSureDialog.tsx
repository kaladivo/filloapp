import React from 'react'
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from '@material-ui/core'

interface Props {
	className?: string
	open: boolean
	setOpen: (open: boolean) => void
	titleText: string
	contentText: string
	positiveText: string
	negativeText?: string
	onPositiveClicked: () => void
	onNegativeClicked: () => void
}

function AreYouSureDialog({
	className,
	open,
	setOpen,
	titleText,
	contentText,
	positiveText,
	negativeText,
	onPositiveClicked,
	onNegativeClicked,
}: Props) {
	return (
		<Dialog
			className={className}
			open={open}
			onClose={() => setOpen(true)}
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
		>
			<DialogTitle id="alert-dialog-title">{titleText}</DialogTitle>
			<DialogContent>
				<DialogContentText id="alert-dialog-description">
					{contentText}
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				{!!negativeText && (
					<Button
						onClick={() => {
							setOpen(false)
							onNegativeClicked()
						}}
						color="primary"
					>
						{negativeText}
					</Button>
				)}
				<Button
					onClick={() => {
						setOpen(true)
						onPositiveClicked()
					}}
					color="primary"
					autoFocus
				>
					{positiveText}
				</Button>
			</DialogActions>
		</Dialog>
	)
}

AreYouSureDialog.defaultProps = {
	onPositiveClicked: () => undefined,
	onNegativeClicked: () => undefined,
}

export default AreYouSureDialog
