const express = require('express');
const fetch = require('node-fetch');
const app = express();

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

app.listen(3000, () => {
	console.log('Proxy server running on http://localhost:3000');
});
