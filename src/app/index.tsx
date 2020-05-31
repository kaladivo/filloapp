import React from 'react'
import {SnackbarProvider} from 'notistack'
import './utils/i18n'
import {ThemeProvider, createMuiTheme, CssBaseline} from '@material-ui/core'

import RootRouter from './components/RootRouter'
import {ApiProvider} from './api/apiContext'

const muiTheme = createMuiTheme({})

function App() {
	return (
		<ThemeProvider theme={muiTheme}>
			<SnackbarProvider
				maxSnack={5}
				anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
			>
				<ApiProvider>
					<CssBaseline />
					<RootRouter />
				</ApiProvider>
			</SnackbarProvider>
		</ThemeProvider>
	)
}

export default App
