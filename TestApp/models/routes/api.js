var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Tournament = mongoose.model('Tournament');
var Round = mongoose.model('Round');
var Match = mongoose.model('Match');
var passport = require('passport');
var Hosts = mongoose.model('Hosts');

// configure auth
var configAuth = require('../config/auth');

//
// API
//

// register a user
router.post('/auth/register', passport.authenticate('local-register', {
    successRedirect: '/',
    failureRedirect: '/bad'
}));

// login a local user using passport
router.post('/auth/login/local', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/'
}));

// logout a user
router.get('/auth/logout', function (req, res)
{
    req.logout();
    res.redirect('/');
})

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
router.get('/auth/login/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
router.get('/auth/login/facebook/callback', passport.authenticate('facebook', { successRedirect: '/',
                                    failureRedirect: '/' }));

// get the current state of a tournament in JSON form
router.get('/tournament/:tournament_id', function (req, res)
{
    Tournament.findById(req.params.tournament_id, function (err, tournament)
    {
        if(err)
        {
            res.sendStatus(400);
            return;
        }
        if(tournament === null)
        {
            res.sendStatus(404);
            return;
        }

        var result = {};
        result._id = tournament._id;
        result.title = tournament.title;
        result.host = tournament.host;
        result.date = tournament.date;
        result.begun = tournament.begun;
        result.active = tournament.active;
        result.players = tournament.players;
        tournament.getRounds(function (rounds)
        {
            result.rounds = rounds;
            res.end(JSON.stringify(result));
            return;
        });
    });
});

// create a new tournament hosted by the user
router.post('/tournament/create', isLoggedIn, function (req, res)
{
    if(!req.body.title)
    {
        return res.status(400).json({ message: 'Please provide title' });
    }

    User.findOne({username: req.user.username}, function (err, user)
    {
        if(err)
        {
            res.sendStatus(400);
            return;
        }
        if(!user)
        {
            res.sendStatus(404);
            return;
        }

        var newTournament = new Tournament();
        newTournament.title = req.body.title;
        newTournament.active = true;
        var date = new Date();
        newTournament.date = date.getMonth() + "-" + date.getDate() + "-" + date.getFullYear() +
            " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        newTournament.host = user.username;
        //user.tournaments_hosted.push(newTournament._id);
        //user.save();
        newTournament.begun = false;
        newTournament.save(function(err)
        {
            if(err)
            {
                res.sendStatus(400);
                return;
            }

            var hosts = new Hosts();
            hosts.host = user.username;
            hosts.tournament_id = newTournament._id;
            hosts.save(function(err)
            {
                if(err)
                {   
                    res.sendStatus(400);
                    return;
                }
                res.end("OK");
            });
        });
    });
});

// add a new player string to the identified tournament
router.post('/tournament/:tournament_id/addplayer', isLoggedIn, function (req, res)
{
    console.log("<Adding player to tournament " + req.params.tournament_id + ">");
    Tournament.findById(req.params.tournament_id, function (err, tournament)
    {
        console.log("<Tournament located>: " + tournament);
        // bad request if there is an error or if there in no player in the post body
        if(err || !req.body.player)
        {
            res.sendStatus(400);
            return;
        }
        // not found if there is no matching tournament in the database
        if(!tournament)
        {
            res.sendStatus(404);
            return;
        }
        // unauthorized if the request did not come from the tournament host
        if(tournament.host !== req.user.username)
        {
            res.sendStatus(401);
            return;
        }
        // bad request if the tournament has already begun
        if(tournament.begun)
        {
            res.status(400).send("Cannot add player to a started Tournament");
            return;
        }
        // bad request if the player name being added is a duplicate
        for(var i = 0; i < tournament.players.length; i++)
        {
            if(tournament.players[i] === req.body.player)
            {
                res.status(400).send("Duplicate Player");
                return;
            }
        }
        
        console.log("<Player to add>: " + req.body.player);
        tournament.players.push(req.body.player);
        tournament.save();
        res.end("OK");
    });
});

// start the tournament
router.get('/tournament/:tournament_id/start', isLoggedIn, function (req, res)
{
    console.log("<Starting tournament " + req.params.tournament_id + ">");
    Tournament.findById(req.params.tournament_id, function (err, tournament)
    {
        console.log("<Tournament located>: " + tournament);
        if(err)
        {
            res.sendStatus(400);
            return;
        }
        if(!tournament)
        {
            res.sendStatus(404);
            return;
        }
        if(tournament.begun)
        {
            res.status(400).send("Tournament has already begun");
            return;
        }
        if(tournament.host !== req.user.username)
        {
            res.sendStatus(401);
            return;
        }
        if(tournament.players.length < 2)
        {
            res.status(400).send("You must have at least two players to start a tournament");
            return;
        }

        console.log("<About to start tournament>");
        tournament.startTournament();
        tournament.save();
        console.log("<Tournament Started>");
        res.end("OK");
    });
});

// advance a player as the winner of their match and into the next round
router.post('/tournament/:tournament_id/advance', isLoggedIn, function (req, res)
{
    console.log("<Adding player to tournament " + req.params.tournament_id + ">");
    Tournament.findById(req.params.tournament_id, function (err, tournament)
    {
        console.log("<Tournament located>: " + tournament);
        // bad request if there is an error or if there is no player in the post body
        if(err || !req.body.player)
        {
            res.sendStatus(400);
            return;
        }
        // not found if there is not matching tournament in the database
        if(!tournament)
        {
            res.sendStatus(404);
            return;
        }
        // unauthorized if the request did not come from the tournament host
        if(tournament.host !== req.user.username)
        {
            res.sendStatus(401);
            return;
        }
        // bad request if tournament has not started yet
        if(!tournament.begun)
        {
            res.status(400).send("Tournament has not yet started");
            return;
        }
        // bad request if the tournament is no longer active
        if(!tournament.active)
        {
            res.status(400).send("Tournament is no longer active");
            return;
        }
        // bad request if player name is not in the tournament
        var validPlayer = false;
        for(var i = 0; i < tournament.players.length; i++)
        {
            if(tournament.players[i] === req.body.player)
            {
                console.log("<" + req.body.player + " is a valid player>");
                validPlayer = true;
                break;
            }
        }
        if(!validPlayer)
        {
            res.status(400).send("Player is not a valid competator");
            return;
        }
        
        console.log("<Player to advance>: " + req.body.player);
        tournament.advancePlayer(req.body.player, function (deactivate)
        {
            if(deactivate)
            {
                tournament.deactivate();
            }
            tournament.save();
            res.end("OK");
        });
    });
});

// return all tournaments hosted by the user
router.get('/user/hosted', isLoggedIn, function (req, res)
{
    User.findOne({ username: req.user.username }, function (err, user)
    {
        if(err)
        {
            res.sendStatus(400);
            return;
        }
        if(!user)
        {
            res.sendStatus(404);
            return;
        }

        Hosts.find({ host: user.username }, function (err, hosts)
        {
            if(err)
            {
                res.sendStatus(400);
                return;
            }
            if(!hosts)
            {
                res.sendStatus(404);
                return;
            }

            var tournament_ids = [];
            for(var i = 0; i < hosts.length; i++)
            {
                tournament_ids.push(hosts[i].tournament_id);
            }
            Tournament.find({_id: {$in: tournament_ids }}, function (err, tournaments)
            {
                if(err)
                {
                    res.sendStatus(400);
                    return;
                }
                if(!tournaments)
                {
                    res.sendStatus(404);
                    return;
                }
                res.end(JSON.stringify(tournaments));
            });
        });
    });
});

router.get('/user/data', isLoggedIn, function (req, res)
{
    res.end(req.user.username);
    /*User.findOne({ username: req.user.username }, function (err, user)
    {
        if(err)
        {
            res.sendStatus(400);
            return;
        }
        if(!user)
        {
            res.sendStatus(404);
            return;
        }
    });*/
});

//------------------------------------------------------------
//  Test API for blog, dev only, will be deleted
//------------------------------------------------------------

router.get('/testTournament', function (req, res)
{
    console.log("TESTING TOURNAMENT CREATION");

    var newTournament = new Tournament();
    var date = new Date();
    newTournament.date = date.getMonth() + "-" + date.getDate() + "-" + date.getFullYear() +
        " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    newTournament.begun = false;
    newTournament.save(function(err)
    {
        if(err)
        {
            res.sendStatus(400);
            return;
        }
        res.end("OK");
    });

    newTournament.addPlayer("Josh");
    newTournament.addPlayer("Clayton");
    newTournament.addPlayer("Macquel");
    newTournament.addPlayer("Alisha");
    newTournament.addPlayer("Jared");
    newTournament.startTournament();
});

router.get('/clearData', function (req, res)
{
    console.log("CLEARING DATABASE");

    Tournament.find({}).remove().exec();
    Round.find({}).remove().exec();
    Match.find({}).remove().exec();
    Hosts.find({}).remove().exec();

    res.end("OK");
});

router.post('/testUser', isLoggedIn, function (req, res)
{
    console.log("<Request>: " + JSON.stringify(req.headers) + "\nBody: " + JSON.stringify(req.body));
    console.log("<SUCCESS>");
    res.end("OK");
});

function isLoggedIn(req, res, next)
{
    //console.log("isLoggedIn");
    //console.log("<User>: " + JSON.stringify(req.user));
    if (req.isAuthenticated())
        return next();

    //console.log("not logged in");
    res.sendStatus(401);
};

//------------------------------------------------------------
// End dev API section
//------------------------------------------------------------

module.exports = router;
