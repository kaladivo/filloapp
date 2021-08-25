import sleep from 'sleep-promise'

export async function inSequence<TAll>(
	values: Array<TAll | PromiseLike<TAll>>,
	options: {delayBetweenMs: number}
): Promise<TAll[]> {
	const delayBetweenMs = options.delayBetweenMs || 0

	const result: TAll[] = []

	for (let i = 0; i < values.length; i += 1) {
		// eslint-disable-next-line no-await-in-loop
		result.push(await values[i])
		// eslint-disable-next-line no-await-in-loop
		await sleep(delayBetweenMs)
	}

	return result
}
