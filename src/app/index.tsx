import React from 'react'
import {SnackbarProvider} from 'notistack'
import './utils/i18n'
import {ThemeProvider, createMuiTheme, CssBaseline} from '@material-ui/core'

import RootRouter from './components/RootRouter'
import {ApiProvider} from './api/apiContext'
import {GapiProvider} from './utils/gapi'
import EnvInfoProvider from './components/EnvInfoProvider'
import AuthProvider from './components/AuthProvider'

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
					{/* The order is super important here. First load api to be able to
					fetch env info. Then fetch env info to be able to init gapi with
					client id. At last init Gapi. All initialization is done within
					the providers (they display loading until proper resources are
					loaded and initialized.) */}
					<EnvInfoProvider>
						<GapiProvider>
							<AuthProvider>
								<ApiProvider>
									<RootRouter />
								</ApiProvider>
							</AuthProvider>
						</GapiProvider>
					</EnvInfoProvider>
				</SnackbarProvider>
			</ThemeProvider>
		</>
	)
}

export default App
