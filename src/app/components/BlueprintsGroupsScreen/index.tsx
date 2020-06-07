import React, {useCallback} from 'react'
import {Typography, makeStyles, createStyles, Button} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {Link} from 'react-router-dom'
import RootContainer from '../RootContainer'
import InfiniteLoadingList from '../InfiniteLoadingList'
import {useApiService} from '../../api/apiContext'
import {BlueprintsGroupPreview} from '../../../constants/models/BlueprintsGroup'
import BlueprintGroupItem from './components/BlueprintsGroupItem'

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {},

		blueprintsList: {
			margin: theme.spacing(-2, 0),
			'& > *': {
				margin: theme.spacing(2, 0),
			},
		},
	})
)

function BlueprintsGroupsScreen() {
	const classes = useStyles()
	const api = useApiService()
	const {t} = useTranslation()

	const loadMore = useCallback(
		async (lastResult: any) => {
			const pagination = {
				limit: 20,
				skip: lastResult
					? lastResult.pagination.limit + lastResult.pagination.skip
					: 0,
			}
			const result = await api.blueprintsGroups.list({pagination})
			return {
				result: {items: result.data, pagination},
				isLast: result.data.length < 20,
			}
		},
		[api]
	)

	return (
		<RootContainer maxWidth="md">
			<Typography variant="h5">{t('BlueprintsGroupScreen.title')}</Typography>
			<Button
				component={Link}
				to="/blueprints-group/new"
				variant="contained"
				color="primary"
			>
				{t('BlueprintsGroupScreen.addNew')}
			</Button>
			<InfiniteLoadingList
				resultToItems={(result) => result.items}
				loadMore={loadMore}
				listContainerClass={classes.blueprintsList}
			>
				{(items: BlueprintsGroupPreview[]) => {
					return items.map((one) => (
						<BlueprintGroupItem key={one.id} blueprintGroup={one} />
					))
				}}
			</InfiniteLoadingList>
		</RootContainer>
	)
}

export default BlueprintsGroupsScreen
