import React from 'react'
import {SnackbarProvider} from 'notistack'
import {ThemeProvider, createMuiTheme, CssBaseline} from '@material-ui/core'
import RootRouter from './components/RootRouter'

const muiTheme = createMuiTheme({})

function App() {
	return (
		<ThemeProvider theme={muiTheme}>
			<SnackbarProvider
				maxSnack={5}
				anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
			>
				<CssBaseline />
				<RootRouter />
			</SnackbarProvider>
		</ThemeProvider>
	)
}

export default App
