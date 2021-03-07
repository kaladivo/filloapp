import React, {useCallback} from 'react'
import {
	Checkbox,
	createStyles,
	FormControlLabel,
	makeStyles,
	TextField,
} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {BlueprintFieldOptions} from '../../../../constants/models/Blueprint'

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

function NumberOptions({options, onChange, className}: Props) {
	const classes = useStyles()
	const {t} = useTranslation()

	const enableMin = useCallback(
		(_, checked: boolean) => {
			if (checked) {
				onChange({...options, min: 0})
			} else {
				onChange({...options, min: undefined})
			}
		},
		[options, onChange]
	)

	const enableMax = useCallback(
		(_, checked: boolean) => {
			if (checked) {
				onChange({...options, max: 0})
			} else {
				onChange({...options, max: undefined})
			}
		},
		[options, onChange]
	)

	console.log(options)

	return (
		<div className={`${classes.root} ${className}`}>
			<div>
				<FormControlLabel
					className={className}
					onChange={enableMin}
					value={options.min !== undefined}
					control={<Checkbox />}
					label={t('EditBlueprintScreen.enableMin')}
				/>

				{options.min !== undefined && (
					<TextField
						fullWidth
						label={t('EditBlueprintScreen.minValue')}
						type="number"
						value={options.min || 0}
						onChange={(e) => {
							onChange({...options, min: e.target.value})
						}}
					/>
				)}
			</div>

			<div>
				<FormControlLabel
					className={className}
					onChange={enableMax}
					value={options.min !== undefined}
					control={<Checkbox />}
					label={t('EditBlueprintScreen.enableMax')}
				/>

				{options.max !== undefined && (
					<TextField
						fullWidth
						label={t('EditBlueprintScreen.maxValue')}
						type="number"
						value={options.max || 0}
						onChange={(e) => {
							onChange({...options, max: e.target.value})
						}}
					/>
				)}
			</div>
		</div>
	)
}

export default NumberOptions
