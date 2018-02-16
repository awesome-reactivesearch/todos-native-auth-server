const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const Appbase = require('appbase-js');

// middlewares
const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

const checkJwt = jwt({
	// Dynamically provide a signing key
	// based on the kid in the header and
	// the singing keys provided by the JWKS endpoint.
	secret: jwksRsa.expressJwtSecret({
		cache: true,
		rateLimit: true,
		jwksRequestsPerMinute: 5,
		jwksUri: 'https://divyanshu.auth0.com/.well-known/jwks.json',
	}),

	// Validate the audience and the issuer.
	audience: 'https://todosnative',
	issuer: 'https://divyanshu.auth0.com/',
	algorithms: ['RS256']
});

const appbaseRef = new Appbase({
	url: "https://scalr.api.appbase.io",
	app: "todos-native-live",
	credentials: "Kgxg0NlC7:423f419c-1121-43cb-82c9-2c155f415f19"
});

const type = 'todos-native-live';

// routes
app.post('/', checkJwt, (req, res) => {
    appbaseRef.index({
	  type,
      body: {
		title: req.body.title,
		completed: false,
		createdAt: Date.now(),
		name: req.body.name,
		avatar: req.body.avatar
	  }
    }).on("data", function(response) {
	  res.send({
		  status: 200,
		  message: 'success'
	  });
    }).on("error", function(error) {
	  console.error(error);
	  res.send(error);
    })
})

app.put('/', checkJwt, (req, res) => {
    appbaseRef.update({
	  id: req.body.id,
	  type,
      body: {
		  doc: {
			  completed: req.body.completed
		  }
	  }
    }).on("data", function(response) {
	  res.send({
		  status: 200,
		  message: 'success'
	  });
    }).on("error", function(error) {
	  console.error(error);
	  res.send(error);
    })
})

app.delete('/', checkJwt, (req, res) => {
	appbaseRef.delete({
		id: req.body.id,
		type
	}).on("data", function(response) {
		res.send({
			status: 200,
			message: 'success'
		});
	}).on("error", function(error) {
		console.error(error);
		res.send(error);
	})
})

app.listen(8000, () => {
	console.log('Node middleware listening on port 8000!');
});
