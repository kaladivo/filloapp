import React, {useCallback} from 'react'
import {Button} from '@material-ui/core'
import {useSnackbar} from 'notistack'
import {useTranslation} from 'react-i18next'
import {useUser} from '../../utils/auth'
import {showFilePicker, PickerMode, PickedDocument} from './utils'

interface Props {
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
}: Props) {
	const user = useUser()
	const {t} = useTranslation()
	const {enqueueSnackbar} = useSnackbar()
	const googleAccessToken = user?.userInfo?.googleAccessToken

	const showPickerAndHandleCallback = useCallback(() => {
		showFilePicker({
			title: pickerTitle,
			userToken: googleAccessToken || '',
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
	}, [googleAccessToken, pickerTitle, onSelected, enqueueSnackbar])

	return (
		<Button className={className} onClick={showPickerAndHandleCallback}>
			{label}
		</Button>
	)
}

DriveFilePickerButton.defaultProps = {
	multiple: false,
}

export default DriveFilePickerButton
