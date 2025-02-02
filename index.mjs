import express from 'express';
import session from 'express-session';
import fetch from 'node-fetch';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { URL } from 'url';

dotenv.config();

const entryEndpoint = '/proxy';
const app = express();
const port = process.env.PORT || 3000; // Ex. to change the port : >npx cross-env PORT=3001 node index.mjs< or >npx cross-env PORT=3001 npm run start< or see .env config file.
const isProduction = process.env.NODE_ENV === 'production';
const cookieMaxAge = parseInt(process.env.COOKIE_MAX_AGE, 10);
app.set('trust proxy', 1);

//#region Middlewares

app.use(helmet());
app.use(morgan('dev'));

app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: true,
	cookie: { secure: isProduction, maxAge: cookieMaxAge }
}));

app.use('*', (req, res, next) => {
	console.log('*****************************');
	console.log('***      New request      ***');
	console.log(`*** Client IP: ${req.headers['x-forwarded-for'] || req.socket.remoteAddress} ***`);
	console.log(`*** Client domain: ${req.hostname}:${req.socket.localPort} ***`);
	console.log(`*** Received url: ${req.url} ***`);
	console.log(`*** Requested url: ${req.query?.url ?? req.originalUrl} ***`);

	next();
});

//#endregion Middlewares

//#region Routes

app.get(entryEndpoint, async (req, res) => {
	let targetUrlBase = req.session?.targetUrlBase ?? '';
	let targetUrl = req.query?.url;
	if (!targetUrl) {
		if (!targetUrlBase || req.url.includes('http'))
			return res.status(400).send("URL manquante en paramètre tel que '/proxy?url=http...' / \nMissing url querystring like '/proxy?url=http...'");
		else {
			const cleanUrl = req.url.replace(entryEndpoint, '');
			targetUrl = targetUrlBase.concat(req.session.targetBasePath).concat(cleanUrl);
			getAndSendData(res, targetUrl);
			return;
		}
	}

	req.session.targetUrlBase = getTargetUrlBase(req, targetUrl);
	getAndSendData(res, targetUrl);
});

app.get('/robots.txt', (_req, res) => {
	res.type('text/plain');
	res.send('User-agent: *\nDisallow: /');
});

app.get('/', (_req, res) => {
	const welcomeMsg = "Bienvenue sur smart-proxy ! \nAjouter le paramètre '/proxy?url=http...' à la route courante en completant l'URL";
	const welcomeMsg_EN = "Welcome to smart-proxy! \nAdd the query parameter '/proxy?url=http...' to the current route by completing the URL";
	res.status(200).send(welcomeMsg.concat(' /\n\n').concat(welcomeMsg_EN));
});

app.get('/*', async (req, res) => {
	const targetUrlBase = req.session?.targetUrlBase ?? '';
	const targetUrl = targetUrlBase.concat(req.originalUrl);
	getAndSendData(res, targetUrl);
});

app.listen(port, () => {
	if (isProduction) {
		console.log(`Proxy server running in production on port ${port}`);
	} else {
		console.log(`Proxy server running in development on http://localhost:${port}`);
	}
});

//#endregion Routes

//#region Helpers

async function getAndSendData(res, targetUrl) {
	console.log(`*** target url: ${targetUrl} ***`);
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

function getTargetUrlBase(req, targetUrl) {
	const parsedUrl = new URL(targetUrl);
	req.session.targetBasePath = parsedUrl.pathname;
	const protocol = parsedUrl.protocol;
	const domain = parsedUrl.hostname;
	const rootUrl = `${protocol}//${domain}`;
	console.log(`*** Requested root url: ${rootUrl} ***`);

	return decodeURIComponent(rootUrl);
}

//#endregion Helpers
