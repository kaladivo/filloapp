import React from 'react'
import {
	Container as MuiContainer,
	ContainerProps,
	makeStyles,
	createStyles,
} from '@material-ui/core'

const useStyles = makeStyles((theme) =>
	createStyles({
		container: {
			flex: 1,
			marginTop: theme.spacing(2),
			marginBottom: theme.spacing(2),
		},
	})
)

interface Props extends ContainerProps {}

function RootContainer({className, children, ...rest}: Props) {
	const classes = useStyles()
	return (
		<MuiContainer className={`${classes.container} ${className}`} {...rest}>
			{children}
		</MuiContainer>
	)
}

RootContainer.defaultProps = {
	maxWidth: 'md',
}

export default RootContainer
