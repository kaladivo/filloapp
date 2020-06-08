import React, {useState, useCallback} from 'react'
import {
	Typography,
	Link,
	Button,
	makeStyles,
	createStyles,
	TextField,
	CircularProgress,
} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {useAsync} from 'react-async'
import {useHistory} from 'react-router-dom'
import RootContainer from '../RootContainer'
import SelectBlueprints from './components/SelectBlueprints'
import {TinyBlueprint} from '../../../constants/models/Blueprint'
import {useApiService} from '../../api/apiContext'
import {BlueprintGroup} from '../../../constants/models/BlueprintsGroup'

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {},
		formContainer: {
			'& > *': {
				margin: theme.spacing(0, 0, 2),
			},
		},
	})
)

function CreateBlueprintGroupScreen() {
	const classes = useStyles()
	const api = useApiService()
	const {t} = useTranslation()
	const history = useHistory()

	const [selected, setSelected] = useState<TinyBlueprint[]>([])
	const [name, setName] = useState('')

	const createGroupTask = useAsync({
		deferFn: useCallback(async () => {
			const result = await api.blueprintsGroups.create({
				name,
				blueprintsIds: selected.map((one) => one.id),
			})
			return result.data
		}, [api, name, selected]),
		onResolve: useCallback(
			(createdGroup: BlueprintGroup) => {
				history.push(`/blueprints-group/${createdGroup.id}/submit`)
			},
			[history]
		),
	})

	const canBeSubmitted =
		name && selected.length > 0 && !createGroupTask.isLoading

	const handleSubmit = useCallback(
		(e) => {
			e.preventDefault()

			createGroupTask.run()
		},
		[createGroupTask]
	)

	return (
		<RootContainer className={classes.root}>
			<form onSubmit={handleSubmit} className={classes.formContainer}>
				<Typography variant="h4">
					{t('CreateBlueprintGroupScreen.title')}
				</Typography>
				<TextField
					fullWidth
					variant="outlined"
					helperText={t('CreateBlueprintGroupScreen.nameHelp')}
					value={name}
					onChange={(e) => setName(e.target.value)}
					label={t('CreateBlueprintGroupScreen.name')}
				/>
				<SelectBlueprints onChange={setSelected} />
				<Typography>
					{t('CreateBlueprintGroupScreen.dontSeeBlueprint')}{' '}
					{/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
					<Link onClick={() => alert(t('common.notImplemented'))}>
						{t('CreateBlueprintGroupScreen.createBlueprint')}
					</Link>
				</Typography>
				<Button
					disabled={!canBeSubmitted}
					variant="contained"
					type="submit"
					color="primary"
					onClick={() => console.log(selected)}
				>
					{createGroupTask.isLoading ? (
						<CircularProgress size={20} color="inherit" />
					) : (
						t('common.submit')
					)}
				</Button>
			</form>
		</RootContainer>
	)
}

export default CreateBlueprintGroupScreen
