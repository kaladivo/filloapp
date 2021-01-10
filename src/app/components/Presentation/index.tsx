import React from 'react'
import {createStyles, makeStyles} from '@material-ui/core'
import PresentationTemplate from '../PresentationTemplate'
import Hero from './components/Hero'
import About from './components/About'
// import Faq from './components/Faq'

const useStyles = makeStyles((theme) =>
	createStyles({
		hero: {
			marginBottom: theme.spacing(25),
		},
	})
)

function Presentation() {
	const styles = useStyles()
	return (
		<PresentationTemplate>
			<Hero className={styles.hero} />
			<About />
			{/* <Faq /> */}
		</PresentationTemplate>
	)
}

export default Presentation
