import FuseLayout from '@fuse/core/FuseLayout';
import FuseTheme from '@fuse/core/FuseTheme';
import { SnackbarProvider } from 'notistack';
import rtlPlugin from 'stylis-plugin-rtl';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { selectCurrentLanguageDirection } from 'app/store/i18nSlice';
import themeLayouts from 'app/theme-layouts/themeLayouts';
import { selectMainTheme } from '@fuse/core/FuseSettings/fuseSettingsSlice';
import MockAdapterProvider from '@mock-api/MockAdapterProvider';
import { useAppSelector } from 'app/store/hooks';
import { useSelector } from 'react-redux';
import React from 'react';
import * as pdfjsLib from "pdfjs-dist";
import withAppProviders from './withAppProviders';
import AuthenticationProvider from './auth/AuthenticationProvider';
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const emotionCacheOptions = {
	rtl: {
		key: 'muirtl',
		stylisPlugins: [rtlPlugin],
		insertionPoint: document.getElementById('emotion-insertion-point')
	},
	ltr: {
		key: 'muiltr',
		stylisPlugins: [],
		insertionPoint: document.getElementById('emotion-insertion-point')
	}
};

/**
 * The main App component.
 */
function App() {
	/**
	 * The language direction from the Redux store.
	 */
	const langDirection = useAppSelector(selectCurrentLanguageDirection);
	/**
	 * The main theme from the Redux store.
	 */
	const mainTheme = useSelector(selectMainTheme);
	// const dispatch = useDispatch();
	// useEffect(() => {
	// 	const client = new Client({
	// 		brokerURL: 'ws://localhost:8080/ws',
	// 		connectHeaders: {},
	// 		debug(str) {
	// 			console.log(str);
	// 		},
	// 		reconnectDelay: 5000,
	// 		heartbeatIncoming: 4000,
	// 		heartbeatOutgoing: 4000,
	// 		webSocketFactory: () => new SockJS('https://back.agfo.ir/ws')
	// 	});
	//
	// 	client.onConnect = () => {
	// 		client.subscribe('/topic/adminNotifications', (message) => {
	// 			const notification = JSON.parse(message.body);
	// 			// const notification = message.body;
	// 			console.log(notification);
	// 			// @ts-ignore
	// 			dispatch(addNotification(notification));
	// 			// @ts-ignore
	// 			// setMessages((prev) => [...prev, notification]);
	// 			// setNo
	// 		});
	// 	};
	//
	// 	client.activate();
	//
	// 	return () => {
	// 		client.deactivate();
	// 	};
	// }, []);
	return (
		<React.StrictMode>
			<MockAdapterProvider>
				<CacheProvider value={createCache(emotionCacheOptions[langDirection])}>
					<FuseTheme
						theme={mainTheme}
						root
					>
						<AuthenticationProvider>
							<SnackbarProvider
								maxSnack={5}
								anchorOrigin={{
									vertical: 'bottom',
									horizontal: 'right'
								}}
								classes={{
									containerRoot: 'bottom-0 right-0 mb-52 md:mb-68 mr-8 lg:mr-80 z-99'
								}}
							>
								<FuseLayout layouts={themeLayouts} />
							</SnackbarProvider>
						</AuthenticationProvider>
					</FuseTheme>
				</CacheProvider>
			</MockAdapterProvider>
		</React.StrictMode>
	);
}

export default withAppProviders(App);


// import axios from 'axios';
/**
 * Axios HTTP Request defaults
 */
// axios.defaults.baseURL = "";
// axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
// axios.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';