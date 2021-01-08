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
import {Section} from '../../../insideSections'

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
			</List>
		</div>
	)
}

export default NavigationList
