import React from 'react'
import {NavLink} from 'react-router-dom'
import {
	ListItem,
	List,
	ListItemIcon,
	ListItemText,
	Divider,
	makeStyles,
	createStyles,
} from '@material-ui/core'
import {useTranslation} from 'react-i18next'
import {Section} from '../../../insideSections'
import {useEnvInfo} from '../../EnvInfoProvider'

const APP_VERSION = String(process.env.REACT_APP_VERSION || 'unknown')

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {
			display: 'flex',
			flexDirection: 'column',
			height: '100%',
		},
		filler: {
			flexGrow: 1,
		},
		toolbar: theme.mixins.toolbar,
		active: {
			backgroundColor: 'rgba(0, 0, 0, 0.04)',
		},
		versionName: {
			color: 'lightgray',
			fontSize: '0.7rem',
			margin: theme.spacing(1, 2),
		},
	})
)

function SectionsList({sections}: {sections: Section[]}) {
	const classes = useStyles()
	return (
		<List>
			{sections.map((section) => {
				if (!section.navigation) return null
				return (
					<ListItem
						key={section.paths.join()}
						button
						component={NavLink}
						exact={section.exact}
						activeClassName={classes.active}
						to={section.navigation.path}
					>
						<ListItemIcon>
							<section.navigation.Icon />
						</ListItemIcon>
						<ListItemText>{section.navigation.label}</ListItemText>
					</ListItem>
				)
			})}
		</List>
	)
}

interface Props {
	sections: Section[]
}

function NavigationList({sections}: Props) {
	const env = useEnvInfo()
	const {t} = useTranslation()
	const classes = useStyles()
	const mainSections = sections.filter(
		(section) => section.navigation?.section === 'main'
	)
	const bottomSections = sections.filter(
		(section) => section.navigation?.section === 'bottom'
	)
	return (
		<div className={classes.root}>
			<div className={classes.toolbar} />
			<Divider />
			<List>
				<SectionsList sections={mainSections} />
			</List>
			<div className={classes.filler} />
			<Divider />
			<List>
				<SectionsList sections={bottomSections} />
				{env.version && (
					<div className={classes.versionName}>
						{t('common.version')} {APP_VERSION}
					</div>
				)}
			</List>
		</div>
	)
}

export default NavigationList
