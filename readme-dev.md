# Dependencies (sources)

Instructions updated at: 06/11/2024, 20h40

## Backend

* "express": "4.21.1" -> https://www.npmjs.com/package/express
* "cors": "2.8.5" -> https://www.npmjs.com/package/cors
* "@google/generative-ai": "0.21.0" -> https://www.npmjs.com/package/@google/generative-ai

## Frontend

* "react": "18.3.1" -> https://www.npmjs.com/package/react
* "react-dom": "18.3.1" -> https://www.npmjs.com/package/react-dom
* "react-scripts": "5.0.1" -> https://www.npmjs.com/package/react-scripts
* "serve": "14.2.4" -> https://www.npmjs.com/package/serve

# Setup

1. If not done already, clone the repository to a local folder of your choosing.

2. **ONLY NEEDED WHEN DEPENDENCIES CHANGE!!** -> If the dependencies (package.json) have changed, to create the package-lock.json with the package.json file dependencies (to speed up docker-compose process by a lot), do the following steps:

* Have npm installed in your OS
* Open a terminal and navigate to the folder where package.json is. Example for backend: "cd ./backend"
* Run the command: npm install

3. After this is done, go to the root folder ("T06_G04") and do the following:

* docker-compose up

4. To access the interface, open this on a browser: http://localhost:3002
