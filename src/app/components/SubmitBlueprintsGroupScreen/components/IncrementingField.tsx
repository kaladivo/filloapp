import React, {useCallback} from 'react'
import {TextField, CircularProgress} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {useAsync} from 'react-async'
import {useApiService} from '../../../api/apiContext'

interface Props {
	className?: string
	type: string
	label: string
	value?: string
}

function IncrementingField({className, label, type, value}: Props) {
	const {t} = useTranslation()
	const api = useApiService()

	const fetchNextValueTask = useAsync({
		promiseFn: useCallback(async () => {
			if (value) return value
			const result = await api.blueprintsGroups.getNextIncValue({
				fieldTypeName: type,
			})
			return result.data.compiledValue
		}, [api, type, value]),
	})

	// TODO handle error
	return (
		<TextField
			margin="normal"
			disabled
			fullWidth
			label={label}
			InputProps={{
				endAdornment: fetchNextValueTask.isLoading ? (
					<CircularProgress size={20} />
				) : null,
			}}
			value={
				fetchNextValueTask.data ? fetchNextValueTask.data : t('common.loading')
			}
			helperText={t('SubmitBlueprintsGroupScreen.idHelp')}
			className={className}
		/>
	)
}

export default IncrementingField
