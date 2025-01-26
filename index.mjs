import express from 'express';
import fetch from 'node-fetch';
import morgan from 'morgan';

const app = express();
const port = process.env.PORT || 3000; // Ex. to change the port : >npx cross-env PORT=3001 node index.mjs< ou >npx cross-env PORT=3001 npm run start<
let targetUrlBase = '';

app.use(morgan('dev'));

app.use('*', (req, res, next) => {
	console.log('*****************************');
	console.log('***      New request      ***');
	console.log(`*** Received url: ${req.url} ***`);
	console.log(`*** Requested url: ${req.query?.url ?? req.originalUrl} ***`);

	next();
});

app.get('/proxy', async (req, res) => {
	const targetUrl = req.query?.url;
	if (!targetUrl) {
		return res.status(400).send('URL manquante');
	}

	const decodedUrl = decodeURIComponent(targetUrl);
	targetUrlBase = decodedUrl;
	getAndSendData(res, decodedUrl);
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

async function getAndSendData(res, targetUrl) {
	console.log(`*** target url: ${targetUrl}`);
	console.log('*****************************');

	try {
		const response = await fetch(targetUrl);
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
