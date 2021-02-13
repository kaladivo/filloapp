import React, {useCallback} from 'react'
import {Button, ButtonProps} from '@material-ui/core'
import {useSnackbar} from 'notistack'
import {useTranslation} from 'react-i18next'
import {useShowFilePicker, PickerMode, PickedDocument} from './utils'

interface Props extends ButtonProps {
	className?: string
	onSelected: (bla: PickedDocument[]) => void
	pickerTitle: string
	pickerMode: PickerMode
	multiple: boolean
	label: string
}

function DriveFilePickerButton({
	className,
	pickerTitle,
	onSelected,
	pickerMode,
	multiple,
	label,
	...rest
}: Props) {
	const {t} = useTranslation()
	const {enqueueSnackbar} = useSnackbar()
	const showFilePicker = useShowFilePicker()

	const showPickerAndHandleCallback = useCallback(() => {
		showFilePicker({
			title: pickerTitle,
			pickerMode,
			multiple,
		}).then((selectedDocs) => {
			if (!selectedDocs || selectedDocs.length === 0) {
				// TODO localization
				enqueueSnackbar(t('DriveFilePicker.nothingSelected'))
				return
			}
			onSelected(selectedDocs)
		})
	}, [
		pickerTitle,
		onSelected,
		enqueueSnackbar,
		multiple,
		pickerMode,
		t,
		showFilePicker,
	])

	return (
		<Button
			{...rest}
			className={className}
			onClick={showPickerAndHandleCallback}
		>
			{label}
		</Button>
	)
}

DriveFilePickerButton.defaultProps = {
	multiple: false,
}

export default DriveFilePickerButton
