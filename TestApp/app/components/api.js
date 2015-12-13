var $ = require('jquery');

//
// API
//
var api = {
    // query the database for a tournament with the specified ID
    getTournament: function (tournamentId, cb)
    {
        var url = '/api/tournament/' + tournamentId;
        $.ajax(
        {
            url: url,
            datatype: 'json',
            type: 'GET',
            success: function (res)
            {
                if(cb)
                    cb(true, res);
            },
            error: function (xhr, status, err)
            {
                if(cb)
                    cb(false, status);
            }
        });
    },
    // create a new tournament
    createTournament: function (title, cb)
    {
        var url = 'api/tournament/create';
        $.ajax(
        {
            url: url,
            type: 'POST',
            data: { title: title },
            success: function (res)
            {
                if(cb)
                    cb(true, res);
            },
            error: function (xhr, status, err)
            {
                if(cb)
                    cb(false, status);
            }
        });
    },
    // register a player to an existing !begun tournament.  This can only be done by a tournament host.
    addPlayer: function (tournament_id, player, cb)
    {
        var url = 'api/tournament/' + tournament_id + '/addplayer';
        $.ajax(
        {
            url: url,
            type: 'POST',
            data: {player: player},
            success: function (res)
            {
                if(cb)
                    cb(true, res);
            },
            error: function (xhr, status, err)
            {
                if(cb)
                    cb(false, status);
            }
        });
    },
    // start the tournament, this generates the rounds and matches as well as closes entries
    startTournament: function (tournament_id, cb)
    {
        var url = 'api/tournament/' + tournament_id + '/start';
        $.ajax(
        {
            url: url,
            type: 'GET',
            datatype: 'json',
            success: function (res)
            {
                if(cb)
                    cb(true, res);
            },
            error: function (xhr, status, err)
            {
                if(cb)
                    cb(false, status);
            }
        });
    },
    // advance a player as the winner of a match and move into the next round
    advancePlayer: function (player, tournament_id, cb)
    {
        var url = 'api/tournament/' + tournament_id + '/advance/';
        $.ajax(
        {
            url: url,
            type: 'POST',
            data: {player: player},
            success: function (res)
            {
                if(cb)
                    cb(true, res);
            },
            error: function (xhr, status, err)
            {
                if(cb)
                    cb(false, status);
            }
        });
    },
    // get all tournaments hosted by the logged in user
    getHosted: function (cb)
    {
        var url = 'api/user/hosted';
        $.ajax(
        {
            url: url,
            type: 'GET',
            datatype: 'json',
            success: function (res)
            {
                if(cb)
                    cb(true, res);
            },
            error: function (xhr, status, err)
            {
                if(cb)
                    cb(false, status);
            }
        });
    },
    // get the user data to store as an authenticated token
    getUserData: function(cb)
    {
        var url = 'api/user/data';
        $.ajax(
        {
            url: url,
            type: 'GET',
            datatype: 'json',
            success: function (user)
            {
                console.log("Successfully logged in locally, saving user: " + user)
                localStorage.user = user;
                if(cb)
                    cb(true, user);
            },
            error: function (xhr, status, err)
            {
                if(cb)
                    cb(false, status);
            }
        });
    },
}

module.exports = api;