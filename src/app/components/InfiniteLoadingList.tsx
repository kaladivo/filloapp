import React, {useCallback, useState, useEffect, useRef} from 'react'
import {useAsync} from 'react-async'
import BottomScrollListener from 'react-bottom-scroll-listener'
import {Typography} from '@material-ui/core'
import LoadingIndicator from './LoadingIndicator'
import RetryableError from './RetryableError'

interface Props<Result, Item> {
	loadMore: (
		lastLoadResult: Result | null
	) => Promise<{result: Result; isLast: boolean}>
	children: (args: Item[]) => React.ReactNode
	resultToItems: (result: Result) => Item[]
	offset?: number
	displayOnLoading: React.ReactNode
	displayOnEnd: React.ReactNode
	listContainerProps: any
	renderRejected: (args: {
		error: Error
		tryAgain: () => void
	}) => React.ReactNode
	ListContainer: React.ElementType
}

function InfiniteLoadingList<Result, Item>({
	loadMore,
	offset,
	resultToItems,
	children,
	displayOnLoading,
	listContainerProps,
	displayOnEnd,
	renderRejected,
	ListContainer,
}: Props<Result, Item>) {
	const [lastResult, setLastResult] = useState<Result | null>(null)
	const [items, setItems] = useState<Item[] | null>(null)
	const [lastReached, setLastReached] = useState(false)
	const itemsRef = useRef<HTMLDivElement>(null)

	const loadMoreCallback = useCallback(
		async ([params]: any) => {
			const result = await loadMore(params)
			return result
		},
		[loadMore]
	)

	const loadMoreTask = useAsync({
		deferFn: loadMoreCallback,
		onResolve: ({result, isLast}) => {
			setLastReached(isLast)
			setLastResult(result)
			setItems((prev) => [...(prev || []), ...resultToItems(result)])
		},
	})

	useEffect(() => {
		if (lastResult === null && loadMoreTask.isInitial) {
			loadMoreTask.run(lastResult)
		}
	}, [loadMoreTask, lastResult])

	const handleBottomReached = useCallback(() => {
		if (loadMoreTask.isLoading || loadMoreTask.isRejected || lastReached) {
			return
		}
		loadMoreTask.run(lastResult)
	}, [loadMoreTask, lastResult, lastReached])

	useEffect(() => {
		const containerHeight = itemsRef.current?.offsetHeight
		if (!containerHeight || !loadMoreTask.isResolved) return
		if (containerHeight <= window.outerHeight) {
			handleBottomReached()
		}
		// eslint-disable-next-line
	}, [items?.length])

	return (
		<BottomScrollListener onBottom={handleBottomReached} offset={offset}>
			<>
				<ListContainer ref={itemsRef} {...listContainerProps}>
					{children(items || [])}
				</ListContainer>
				{(loadMoreTask.isPending || loadMoreTask.isInitial) && displayOnLoading}
				{loadMoreTask.isRejected &&
					renderRejected({
						error: loadMoreTask.error,
						tryAgain: () => loadMoreTask.run(lastResult),
					})}
				{lastReached && displayOnEnd}
			</>
		</BottomScrollListener>
	)
}

InfiniteLoadingList.defaultProps = {
	offset: 500,
	displayOnLoading: <LoadingIndicator />,
	displayOnEnd: <Typography align="center">End of the list reached</Typography>,
	ListContainer: 'div',
	listContainerProps: {},
	renderRejected: ({error, tryAgain}: {error: Error; tryAgain: () => void}) => (
		<RetryableError
			error={error}
			text="Unable to load items"
			onTryAgain={tryAgain}
		/>
	),
}

export default InfiniteLoadingList
