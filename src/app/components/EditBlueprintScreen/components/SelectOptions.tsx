import React, {useCallback} from 'react'
import {
	createStyles,
	IconButton,
	InputAdornment,
	makeStyles,
	TextField,
} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {Add, Remove} from '@material-ui/icons'
import {BlueprintFieldOptions} from '../../../../constants/models/Blueprint'

function arrayWithAllDefined(array: any[]) {
	return array.map((one) =>
		one === undefined ? {id: Date.now(), value: ''} : one
	)
}

const useStyles = makeStyles(() =>
	createStyles({
		root: {},
	})
)

interface Props {
	className?: string
	options: BlueprintFieldOptions
	onChange: (value: BlueprintFieldOptions) => void
}

function SelectOptions({className, options, onChange}: Props) {
	const classes = useStyles()
	const {t} = useTranslation()

	const handleOneOptionChange = useCallback(
		(index: number) => (e: any) => {
			const newSelectOptions = [...options.selectOptions]
			newSelectOptions[index].value = e.target.value
			onChange({
				...options,
				selectOptions: arrayWithAllDefined(newSelectOptions),
			})
		},
		[onChange, options]
	)

	const handleAdd = useCallback(() => {
		onChange({
			...options,
			selectOptions: [...options.selectOptions, {id: Date.now(), value: ''}],
		})
	}, [onChange, options])

	const handleRemove = useCallback(
		(index: number) => () => {
			const newSelectOptions = [...options.selectOptions]
			newSelectOptions.splice(index, 1)
			onChange({...options, selectOptions: newSelectOptions})
		},
		[onChange, options]
	)

	// Make sure all positions contains string

	return (
		<div className={`${classes.root} ${className}`}>
			<TextField
				fullWidth
				onChange={handleOneOptionChange(0)}
				value={options.selectOptions[0]?.value || ''}
				label={t('EditBlueprintScreen.selectOptionValue', {number: 1})}
				InputProps={{
					endAdornment: options.selectOptions.length > 1 && (
						<InputAdornment position="start">
							<IconButton onClick={handleRemove(0)}>
								<Remove />
							</IconButton>
						</InputAdornment>
					),
				}}
			/>
			{options.selectOptions.slice(1).map((option: any, index: number) => (
				<TextField
					margin="normal"
					fullWidth
					key={option.id}
					onChange={handleOneOptionChange(index + 1)}
					value={option.value}
					label={t('EditBlueprintScreen.selectOptionValue', {
						number: index + 2,
					})}
					InputProps={{
						endAdornment: (
							<InputAdornment position="start">
								<IconButton onClick={handleRemove(index + 2)}>
									<Remove />
								</IconButton>
							</InputAdornment>
						),
					}}
				/>
			))}
			<div>
				<IconButton onClick={handleAdd}>
					<Add />
				</IconButton>
			</div>
		</div>
	)
}

export default SelectOptions
