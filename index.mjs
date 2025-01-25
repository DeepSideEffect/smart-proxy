import express from 'express';
import fetch from 'node-fetch';
import morgan from 'morgan';

const app = express();
const port = process.env.PORT || 3000;

app.use(morgan('dev'));

app.get('/proxy', async (req, res) => {
	const targetUrl = req.query.url;
	if (!targetUrl) {
		return res.status(400).send('URL manquante');
	}

	try {
		const decodedUrl = decodeURIComponent(targetUrl);
		const response = await fetch(decodedUrl);
		const data = await response.text();
		res.set('Access-Control-Allow-Origin', '*');
		res.send(data);
	} catch (error) {
		res.status(500).send('Erreur lors de la récupération des données');
	}
});

app.listen(port, () => {
	console.log(`Proxy server running on http://localhost:${port}`);
});

// Use it with : PORT=3000 node index.mjs
