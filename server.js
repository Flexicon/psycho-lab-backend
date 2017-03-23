// server.js

// BASE SETUP
// =============================================================================

var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var NodeCouchDb = require('node-couchdb');

var couch = new NodeCouchDb();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 9000;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// Logging function
router.use(function(req, res, next) {
    // do logging
    console.log('Api call...');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'API Works!!!' });   
});

router.route('/scores').post((req, res) => {
    var _correct = parseInt(req.body.correct);
    var _wrong = parseInt(req.body.wrong);
    var _reaction_time = parseFloat(req.body.reaction_time);

    couch.insert('scores', {
        user: req.body.user,
        correct: _correct,
        wrong: _wrong,
        attempts: _correct + _wrong,
        reaction_time: _reaction_time
    }).then((data, headers, status) => {
        res.json({message: 'OK'});
    }, err => {
        res.send(err);
    });
}).get((req, res) => {
    couch.get('scores', '_all_docs?include_docs=true').then((data, headers, status) => {
        res.json(data.data);
    }, err => {
        res.send(err);
    });
});

router.route('/scores/:id').get((req, res) => {
    couch.get('scores', req.params.id).then((data, headers, status) => {
        res.json(data.data);
    }, err => {
        res.send(err);
    });
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
