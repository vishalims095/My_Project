import express from 'express';
import bodyParser from 'body-parser';
import environment from './Config/environment';
import config from './Config/development.json';
import path from 'path';
import glob from 'glob';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;
process.env.NODE_ENV = environment.configuration;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../src/uploads')));
app.use(cors());

let initRoutes = () => {
	// including all routes
	glob("./Routes/*.js", {cwd: path.resolve("./src")}, (err, routes) => {
		if (err) {
			console.log("Error occured including routes");
			return;
		}
		routes.forEach((routePath) => {
			require(routePath).getRouter(app); // eslint-disable-line
		});
		console.log("included " + routes.length + " route files");
	});
}

initRoutes();

app.listen(port, () => {
	console.log("Server is running on port "+port);
});