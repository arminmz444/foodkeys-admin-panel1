import FuseLayout from '@fuse/core/FuseLayout';
import FuseTheme from '@fuse/core/FuseTheme';
import { SnackbarProvider, MaterialDesignContent } from 'notistack';
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
import { styled } from '@mui/material/styles';

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

// Custom styled snackbar components for better appearance
const StyledMaterialDesignContent = styled(MaterialDesignContent)(({ theme }) => ({
	'&.notistack-MuiContent': {
		fontFamily: theme.typography.fontFamily,
		fontSize: '1.05rem',
		fontWeight: 500,
		borderRadius: '14px',
		padding: '14px 22px',
		boxShadow: '0 8px 32px -8px rgba(0,0,0,0.25)',
		minWidth: '300px',
		backdropFilter: 'blur(10px)',
	},
	'&.notistack-MuiContent-success': {
		background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
		color: '#fff',
		'& .MuiSvgIcon-root': {
			color: '#fff',
		},
	},
	'&.notistack-MuiContent-error': {
		background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
		color: '#fff',
		'& .MuiSvgIcon-root': {
			color: '#fff',
		},
	},
	'&.notistack-MuiContent-warning': {
		background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
		color: '#fff',
		'& .MuiSvgIcon-root': {
			color: '#fff',
		},
	},
	'&.notistack-MuiContent-info': {
		background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
		color: '#fff',
		'& .MuiSvgIcon-root': {
			color: '#fff',
		},
	},
	'& #notistack-snackbar': {
		fontSize: '1.15rem',
		fontWeight: 500,
		lineHeight: 1.5,
	},
}));

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
								autoHideDuration={4000}
								Components={{
									success: StyledMaterialDesignContent,
									error: StyledMaterialDesignContent,
									warning: StyledMaterialDesignContent,
									info: StyledMaterialDesignContent,
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