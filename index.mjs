import express from 'express';
import fetch from 'node-fetch';
import morgan from 'morgan';
import helmet from 'helmet';
import { URL } from 'url';

const entryEndpoint = '/proxy';
const app = express();
const port = process.env.PORT || 3000; // Ex. to change the port : >npx cross-env PORT=3001 node index.mjs< ou >npx cross-env PORT=3001 npm run start<
let targetUrlBase = '';
let targetBasePath = '';

//#region Middlewares

app.use(helmet());
app.use(morgan('dev'));

app.use('*', (req, res, next) => {
	console.log('*****************************');
	console.log('***      New request      ***');
	console.log(`*** Received url: ${req.url} ***`);
	console.log(`*** Requested url: ${req.query?.url ?? req.originalUrl} ***`);

	next();
});

//#endregion Middlewares

//#region Routes

app.get(entryEndpoint, async (req, res) => {
	let targetUrl = req.query?.url;
	if (!targetUrl) {
		if (!targetUrlBase || req.url.includes('http'))
			return res.status(400).send('URL manquante');
		else {
			const cleanUrl = req.url.replace(entryEndpoint, '');
			targetUrl = targetUrlBase.concat(targetBasePath).concat(cleanUrl);
			return getAndSendData(res, targetUrl);
		}
	}

	targetUrlBase = getTargetUrlBase(targetUrl);
	getAndSendData(res, targetUrl);
});

app.get('/*', async (req, res) => {
	const targetUrl = targetUrlBase.concat(req.originalUrl);
	getAndSendData(res, targetUrl);
});

app.listen(port, () => {
	if (process.env.NODE_ENV === 'production') {
		console.log(`Proxy server running in production on port ${port}`);
	} else {
		console.log(`Proxy server running in development on http://localhost:${port}`);
	}
});

//#endregion Routes

//#region Helpers

async function getAndSendData(res, targetUrl) {
	console.log(`*** target url: ${targetUrl}`);
	console.log('*****************************');

	try {
		const decodedUrl = decodeURIComponent(targetUrl);
		const response = await fetch(decodedUrl);
		const contentType = response.headers.get('content-type');
		res.set('Access-Control-Allow-Origin', '*');
		res.set('Content-Type', contentType);
		const data = await response.arrayBuffer();
		res.send(Buffer.from(data));

	} catch (error) {
		console.error('Erreur lors de la récupération des données:', error);
		res.status(500).send('Erreur lors de la récupération des données');
	}
}

function getTargetUrlBase(targetUrl) {
	const parsedUrl = new URL(targetUrl);
	targetBasePath = parsedUrl.pathname;
	const protocol = parsedUrl.protocol;
	const domain = parsedUrl.hostname;
	const rootUrl = `${protocol}//${domain}`;
	console.log(`*** Requested root url: ${rootUrl} ***`);

	return decodeURIComponent(rootUrl);
}

//#endregion Helpers
