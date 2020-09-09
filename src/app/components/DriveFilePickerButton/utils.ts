import {useCallback} from 'react'
import {useEnvInfo} from '../EnvInfoProvider'

export interface PickedDocument {
	id: string
	name: string
	parentId: string
	mimeType: string
}

export type PickerMode = 'documents' | 'folders' | 'any'

export function useShowFilePicker() {
	const {googlePickerDeveloperKey} = useEnvInfo()

	return useCallback(
		async ({
			title,
			pickerMode,
			userToken,
			multiple,
		}: {
			title: string
			userToken: string
			pickerMode: PickerMode
			multiple: boolean
		}): Promise<PickedDocument[] | null> => {
			return new Promise((resolve, reject) => {
				let builtPicker: any = null
				// @ts-ignore
				const {picker}: {picker: any} = window.google

				function pickerCallback(response: any) {
					if (response.action === 'loaded') return

					if (response.action === picker.Action.CANCEL) {
						resolve(null)
						if (builtPicker) builtPicker.dispose()
						return
					}
					if (response.action !== picker.Action.PICKED) {
						reject(
							new Error(
								`Unexpected picker response ${JSON.stringify(response)}`
							)
						)
						if (builtPicker) builtPicker.dispose()
						return
					}

					resolve(response.docs?.length > 0 ? response.docs : null)
					if (builtPicker) builtPicker.dispose()
				}

				console.log('Token', {userToken})
				const builder = new picker.PickerBuilder()
					.setOAuthToken(userToken)
					.setTitle(title)
					.setDeveloperKey(googlePickerDeveloperKey)
					.enableFeature(picker.Feature.MINE_ONLY)
					.setCallback(pickerCallback)
					.setOrigin(`${window.location.protocol}//${window.location.host}`)

				if (pickerMode === 'documents') {
					builder
						.addView(picker.ViewId.DOCUMENTS)
						.setSelectableMimeTypes('application/vnd.google-apps.document')
				} else if (pickerMode === 'folders') {
					const docsView = new picker.DocsView()
						.setIncludeFolders(true)
						.setMimeTypes('application/vnd.google-apps.folder')
						.setSelectFolderEnabled(true)

					builder
						.addView(docsView)
						.setSelectableMimeTypes('application/vnd.google-apps.folder')
				} else {
					builder.addView(picker.ViewId.DOCS)
				}

				if (multiple) {
					builder.enableFeature(picker.Feature.MULTISELECT_ENABLED)
				} else {
					builder.disableFeature(picker.Feature.MULTISELECT_ENABLED)
				}

				builtPicker = builder.build()
				builtPicker.setVisible(true)
			})
		},
		[googlePickerDeveloperKey]
	)
}
