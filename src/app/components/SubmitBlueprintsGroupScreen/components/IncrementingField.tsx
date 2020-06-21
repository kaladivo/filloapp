import React, {useCallback} from 'react'
import {TextField, CircularProgress} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {useAsync} from 'react-async'
import {useApiService} from '../../../api/apiContext'

interface Props {
	className?: string
	type: string
}

function IncrementingField({className, type}: Props) {
	const {t} = useTranslation()
	const api = useApiService()

	const fetchNextValueTask = useAsync({
		promiseFn: useCallback(async () => {
			const result = await api.blueprintsGroups.getNextIncValue({
				fieldTypeName: type,
			})
			return result.data.compiledValue
		}, [api, type]),
	})

	// TODO handle error
	return (
		<TextField
			margin="normal"
			disabled
			fullWidth
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
