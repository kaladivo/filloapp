import React, {useCallback, useState} from 'react'
import {Autocomplete} from '@material-ui/lab'
import {useAsync} from 'react-async'
import {
	TextField,
	CircularProgress,
	makeStyles,
	createStyles,
	Tooltip,
	Checkbox,
} from '@material-ui/core'
import WarningIcon from '@material-ui/icons/Warning'
import {useTranslation} from 'react-i18next'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import {useApiService} from '../../../api/apiContext'
import {TinyBlueprint} from '../../../../constants/models/Blueprint'

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />

interface Props {
	className?: string
	onChange: (items: TinyBlueprint[]) => void
}

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {},
		warningIcon: {
			cursor: 'pointer',
		},
		checkbox: {
			marginRight: theme.spacing(2),
		},
	})
)

function SelectBlueprints({className, onChange}: Props) {
	const classes = useStyles()
	const {t} = useTranslation()
	const api = useApiService()
	const [selectedValue, setSelectedValue] = useState<TinyBlueprint[]>([])

	const handleChange = useCallback(
		(_e: any, newValue: TinyBlueprint[]) => {
			setSelectedValue(newValue)
			onChange(newValue)
		},
		[setSelectedValue, onChange]
	)

	const fetchBlueprintsTask = useAsync({
		promiseFn: useCallback(async () => {
			const blueprints = await api.blueprints.listBlueprints()
			return blueprints.data
		}, [api]),
	})

	const values: TinyBlueprint[] =
		fetchBlueprintsTask.data || ([] as TinyBlueprint[])
	const {isLoading, isRejected} = fetchBlueprintsTask

	return (
		<div className={className}>
			<Autocomplete
				value={selectedValue}
				options={values}
				multiple
				getOptionSelected={(option, value) => option.id === value.id}
				getOptionLabel={(option) => option.name}
				onChange={handleChange}
				selectOnFocus
				renderOption={(option, {selected}) => {
					return (
						<>
							<Checkbox
								icon={icon}
								checkedIcon={checkedIcon}
								style={{marginRight: 8}}
								checked={selected}
							/>
							{option.name}
						</>
					)
				}}
				disableCloseOnSelect
				renderInput={(params) => (
					<TextField
						{...params}
						label={t('CreateBlueprintGroupScreen.selectBlueprintsToGenerate')}
						variant="outlined"
						InputProps={{
							...params.InputProps,
							endAdornment: (
								<>
									{isRejected && (
										<Tooltip title={t('common.unexpectedError') || 'error'}>
											<WarningIcon
												className={classes.warningIcon}
												onClick={fetchBlueprintsTask.reload}
												color="error"
											/>
										</Tooltip>
									)}
									{isLoading && <CircularProgress color="inherit" size={20} />}
									{params.InputProps.endAdornment}
								</>
							),
						}}
					/>
				)}
			/>
		</div>
	)
}

export default SelectBlueprints
