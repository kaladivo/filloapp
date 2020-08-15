import React, {useCallback, useState} from 'react'
import {
	Typography,
	makeStyles,
	createStyles,
	Button,
	Grid,
	TextField,
} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {Link} from 'react-router-dom'
import {useDebounce} from 'use-debounce'
import RootContainer from '../RootContainer'
import InfiniteLoadingList from '../InfiniteLoadingList'
import {useApiService} from '../../api/apiContext'
import {BlueprintsGroupPreview} from '../../../constants/models/BlueprintsGroup'
import BlueprintGroupItem from './components/BlueprintsGroupItem'

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {},
		newButton: {
			marginTop: theme.spacing(1),
			marginBottom: theme.spacing(3),
		},
		blueprintsList: {
			margin: theme.spacing(2, -1),
		},
	})
)

function BlueprintsGroupsScreen() {
	const classes = useStyles()
	const api = useApiService()
	const {t} = useTranslation()
	const [searchQuery, setSearchQuery] = useState('')
	const [debouncedQuery] = useDebounce(searchQuery, 300)

	const loadMore = useCallback(
		async (lastResult: any) => {
			const pagination = {
				limit: 20,
				skip: lastResult
					? lastResult.pagination.limit + lastResult.pagination.skip
					: 0,
			}
			const result = debouncedQuery
				? await api.blueprintsGroups.search({
						query: debouncedQuery,
						pagination,
				  })
				: await api.blueprintsGroups.list({pagination})

			return {
				result: {items: result.data, pagination},
				isLast: result.data.length < 20,
			}
		},
		[api, debouncedQuery]
	)

	return (
		<RootContainer maxWidth="md">
			<Typography variant="h5">{t('BlueprintsGroupScreen.title')}</Typography>
			<Button
				className={classes.newButton}
				component={Link}
				to="/blueprints-group/new"
				variant="contained"
				color="primary"
			>
				{t('BlueprintsGroupScreen.addNew')}
			</Button>
			<TextField
				fullWidth
				label={t('BlueprintsGroupScreen.searchLabel')}
				variant="outlined"
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
			/>
			<InfiniteLoadingList
				key={debouncedQuery}
				resultToItems={(result) => result.items}
				loadMore={loadMore}
				ListContainer={Grid}
				listContainerProps={{
					className: classes.blueprintsList,
					container: true,
					spacing: 2,
				}}
			>
				{(items: BlueprintsGroupPreview[]) => {
					return items.map((one) => (
						<Grid key={one.id} item xs={12} sm={6} md={4}>
							<BlueprintGroupItem blueprintGroup={one} />
						</Grid>
					))
				}}
			</InfiniteLoadingList>
		</RootContainer>
	)
}

export default BlueprintsGroupsScreen
