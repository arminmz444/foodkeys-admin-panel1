import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import jsconfigPaths from 'vite-jsconfig-paths';
import path from 'path';
// import {nodePolyfills} from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		// nodePolyfills(),
		react({
			jsxImportSource: '@emotion/react'
		}),
		jsconfigPaths({
			parseNative: false
		}),
		svgrPlugin(),
		{
			name: 'custom-hmr-control',
			handleHotUpdate({ file, server }) {
				if (file.includes('src/app/configs/')) {
					server.ws.send({
						type: 'full-reload'
					});
					return [];
				}
			}
		}
	],
	build: {
		outDir: 'build'
	},
	server: {
		open: true,
		port: 3000
	},
	define: {
		global: 'window',
		'process.env': JSON.stringify(''),
		'process.argv': JSON.stringify(''),
		'process.env.NODE_DEBUG': JSON.stringify(''),
		'process.stderr.fd': JSON.stringify(''),
	},
	resolve: {
		alias: {
			'@': '/src',
			'@fuse': '/src/@fuse',
			'@history': '/src/@history',
			'@lodash': '/src/@lodash',
			'@mock-api': '/src/@mock-api',
			'@schema': '/src/@schema',
			'app/store': '/src/app/store',
			'app/shared-components': '/src/app/shared-components',
			'app/configs': '/src/app/configs',
			'app/theme-layouts': '/src/app/theme-layouts',
			'app/AppContext': '/src/app/AppContext',
			// Fix: date-fns v3 has only named exports for longFormatters,
			// but @mui/x-date-pickers and date-fns-jalali expect a default import.
			// This shim provides both named and default exports.
			'date-fns/_lib/format/longFormatters': path.resolve(__dirname, 'src/utils/date-fns-longFormatters-shim.mjs'),
		}
	},
	optimizeDeps: {
		include: [
			'@mui/icons-material',
			'@mui/material',
			'@mui/base',
			'@mui/styles',
			'@mui/system',
			'@mui/utils',
			'@emotion/cache',
			'@emotion/react',
			'@emotion/styled',
			'lodash'
		],
		exclude: [],
		esbuildOptions: {
			loader: {
				'.js': 'jsx'
			}
		}
	}
});
