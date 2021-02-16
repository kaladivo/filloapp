import React, {useCallback} from 'react'
import {Link} from 'react-router-dom'
import {Button, Typography} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import RootContainer from '../RootContainer'
import {useApiService} from '../../api/apiContext'
import {Blueprint} from '../../../constants/models/Blueprint'
import {PaginationPosition} from '../../../constants/models/Pagination'
import InfiniteLoadingList from '../InfiniteLoadingList'

interface Result {
	items: Blueprint[]
	pagination: PaginationPosition
}

function BlueprintsListScreen() {
	const {t} = useTranslation()
	const api = useApiService()

	const loadMore = useCallback(
		async (lastResult: Result | null) => {
			const pagination = {
				limit: 20,
				skip: lastResult
					? lastResult.pagination.limit + lastResult.pagination.skip
					: 0,
			}

			const result = await api.blueprints.list({
				onlySubmitted: false,
				pagination,
			})
			const blueprints = result.data

			return {
				isLast: blueprints.length === 0,
				result: {items: blueprints, pagination},
			}
		},
		[api]
	)

	const resultToItems = useCallback((result: Result) => {
		return result.items
	}, [])

	return (
		<RootContainer>
			<Button
				component={Link}
				to="/blueprints/create"
				variant="contained"
				color="primary"
			>
				{t('BlueprintsListScreen.createNew')}
			</Button>
			<InfiniteLoadingList resultToItems={resultToItems} loadMore={loadMore}>
				{(items: Blueprint[]) => {
					return items.map((one) => (
						<div key={one.id}>
							<Typography>{one.name}</Typography>
							<Button
								component={Link}
								to={`blueprints/${one.id}/edit`}
								variant="contained"
								color="primary"
							>
								Edit
							</Button>
						</div>
					))
				}}
			</InfiniteLoadingList>
		</RootContainer>
	)
}

export default BlueprintsListScreen
