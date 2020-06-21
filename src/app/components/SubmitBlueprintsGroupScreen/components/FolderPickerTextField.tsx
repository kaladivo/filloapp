import React, {useState, useEffect} from 'react'
import {TextField} from '@material-ui/core'
import {useTranslation} from 'react-i18next'

interface Props {
	className?: string
	onChange: (folderId?: string) => void
}

function FolderPickerTextField({className, onChange}: Props) {
	const {t} = useTranslation()
	const [text, setText] = useState('')

	const [isInvalid, setIsInvalid] = useState(false)

	useEffect(() => {
		if (!text) {
			setIsInvalid(false)
			return
		}
		const matches = `${text}/`.match(
			/drive\.google\.com\/drive\/.*\/folders\/(.*)\//
		)
		if (!matches) {
			setIsInvalid(true)
			onChange('')
		} else if (matches.length < 2) {
			setIsInvalid(true)
			onChange('')
		} else {
			setIsInvalid(false)
			const folderId = matches[1]
			onChange(folderId)
		}
	}, [setIsInvalid, text])

	return (
		<TextField
			fullWidth
			value={text}
			error={isInvalid}
			onChange={(e) => setText(e.target.value)}
			helperText={
				isInvalid
					? t('SubmitBlueprintsGroupScreen.folderFieldBadFormat')
					: t('SubmitBlueprintsGroupScreen.folderFieldHelp')
			}
			label={t('SubmitBlueprintsGroupScreen.folderFieldLabel')}
			className={className}
		/>
	)
}

export default FolderPickerTextField
