# Smart Proxy

## Configuration

1. **Cloner le dépôt** :
	```bash
	git clone https://github.com/DeepSideEffect/smart-proxy.git
	cd smart-proxy
	```
2. **Installer les dépendances** :
	```bash
	npm install
	```
3. **Configurer les variables d'environnement** :
	- Copiez le fichier *.env.example* en *.env* :
		```bash
		cp .env.example .env
		```
	- Modifiez le fichier *.env* et remplacez les valeurs par défaut par vos propres valeurs :
		```plaintext
		PORT=3000
		SESSION_SECRET=Your-Secret-Key-Here
		COOKIE_MAX_AGE=86400000
		```
4. **Démarrer l'application** :
	- En environnement de production :
		```bash
		npm start
		```
	- En environnement de développement :
		```bash
		npm run start:dev
		```
## Utilisation
Ajouter `/proxy?url=` à la suite de l'adresse courante du serveur et avant l'url visée.\
Par exemple, en local avec le port par défaut, pour viser l'url suivante `https://www.exemple.com` essayer avec `http://localhost:3000/proxy?url=https://www.google.com`.

## Dépendances
- *express*
- *express-session*
- *node-fetch*
- *morgan*
- *helmet*
- *dotenv*
