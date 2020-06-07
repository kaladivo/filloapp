import {useTranslation} from 'react-i18next'
import HomeIcon from '@material-ui/icons/Home'

import BlueprintsGroupsScreen from './components/BlueprintsGroupsScreen'
import BlueprintsGroupDetailScreen from './components/BlueprintsGroupDetailScreen'
import SubmitBlueprintsGroupScreen from './components/SubmitBlueprintsGroupScreen'
import CreateBlueprintGroupScreen from './components/CreateBlueprintGroupScreen'
import DevScreen from './components/DevScreen'

export interface Section {
	paths: string[]
	Component: React.ElementType
	exact?: boolean
	/**
	 * Regarding navigation
	 */
	navigation?: {
		path: string
		label: string
		Icon: React.ElementType
		section: 'bottom' | 'main'
	}
}

function useSections(): Section[] {
	const {t} = useTranslation()

	const sections: Section[] = [
		{
			paths: ['/'],
			Component: BlueprintsGroupsScreen,
			exact: true,
			navigation: {
				path: '/',
				label: t('sections.blueprintsGroups'),
				Icon: HomeIcon,
				section: 'main',
			},
		},
		{
			paths: ['/blueprints-group/new'],
			Component: CreateBlueprintGroupScreen,
		},
		{
			paths: ['/blueprints-group/:id/submit'],
			Component: SubmitBlueprintsGroupScreen,
		},
		{
			paths: ['/blueprints-group/:id'],
			Component: BlueprintsGroupDetailScreen,
		},
	]

	if (process.env.NODE_ENV === 'development') {
		sections.push({
			paths: ['/dev'],
			Component: DevScreen,
			exact: true,
			navigation: {
				path: '/dev',
				label: 'Dev',
				Icon: HomeIcon,
				section: 'bottom',
			},
		})
	}
	return sections
}

export default useSections
