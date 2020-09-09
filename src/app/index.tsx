import React from 'react'
import {SnackbarProvider} from 'notistack'
import './utils/i18n'
import {ThemeProvider, createMuiTheme, CssBaseline} from '@material-ui/core'

import RootRouter from './components/RootRouter'
import {ApiProvider} from './api/apiContext'
import {GapiProvider} from './utils/gapi'
import EnvInfoProvider from './components/EnvInfoProvider'

const muiTheme = createMuiTheme({})

function App() {
	return (
		<>
			<ThemeProvider theme={muiTheme}>
				<CssBaseline />
				<SnackbarProvider
					maxSnack={5}
					anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
				>
					<ApiProvider>
						<EnvInfoProvider>
							<GapiProvider>
								<RootRouter />
							</GapiProvider>
						</EnvInfoProvider>
					</ApiProvider>
				</SnackbarProvider>
			</ThemeProvider>
		</>
	)
}

export default App
