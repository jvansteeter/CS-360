//set up react
var React = require("react");
var ReactRouter = require("react-router");
var api = require('./api.js');
var $ = require('jquery');

var Dev = React.createClass({  
	register: function(event)
	{
		event.preventDefault();
		var username = "test1";
		var password = "this";

		api.registerLocal(username, password, function (success, result)
		{
			if(success)
			{
				console.log(result);
			}
		});
	},
	createTournament: function(event)
	{
		event.preventDefault();

		api.createTournament("Test Tournament", function (success, result)
		{
			if(success)
			{
				console.log(result);
			}
		});
	},
	getHosted: function(event)
	{
		event.preventDefault();

		api.getHosted(function (success, result)
		{
			if(success)
			{
				console.log(JSON.parse(result));
			}
		});
	},
	isLoggedIn: function(event)
	{
		event.preventDefault();

		if(!localStorage.user)
		{
			console.log("User not logged in");
		}
		else
		{
			console.log("Logged In: " + localStorage.user);
		}
	},
	logout: function(event)
	{
		event.preventDefault();

		api.logout(function (success, result)
		{
			if(success)
			{
				console.log("<Successfully logged out>: " + result);
			}
		});
	},
	getUserData: function(event)
	{
		event.preventDefault();

		api.getUserData(function (success, result)
		{
			if(success)
			{
				console.log("<Successfully retreived user data: " + result);
			}
		});
	},
	clearData: function(event)
	{
		event.preventDefault();

		var url = 'api/clearData';
		$.ajax(
		{
			url: url,
			type: 'GET',
			success: function (res)
            {
            	console.log("Cleared Database of tournaments, rounds, matches, and hosts");
            },
            error: function (xhr, status, err)
            {
                console.log(status);
            }
		});
	},
	addPlayer: function(event)
	{
		event.preventDefault();

		var playerName = this.refs.playerName.value;
		var tournament_id = this.refs.tournamentID.value;
		api.addPlayer(this.refs.tournamentID.value, playerName, function (success, res)
		{
			if(success)
			{
				console.log("Added " + playerName + " to " + tournament_id + " : " + res);
			}
			else
			{
				console.log("Adding player Failed miserably.  You suck at life!");
			}
		});
	},
	startTournament: function(event)
	{
		event.preventDefault();

		var tournament_id = this.refs.startTournament.value;
		api.startTournament(tournament_id, function (success, res)
		{
			if(success)
			{
				console.log("Started tournament");
			}
			else
			{
				console.log("DAMN DAMN DAMN");
			}
		});
	},
	getTournament: function(event)
	{
		event.preventDefault();

		var tournament_id = this.refs.getTournament.value;
		api.getTournament(tournament_id, function (success, tournament)
		{
			if(success)
			{
				console.log(JSON.parse(tournament));
			}
		});
	},
	advancePlayer: function(event)
	{
		event.preventDefault();

		var player = this.refs.advancePlayer.value;
		var tournament_id = this.refs.advanceTourney.value;
		api.advancePlayer(player, tournament_id, function (success, res)
		{
			if(success)
			{
				console.log(res);
			}
		});
	},


  render: function(){
    return (
      <div>
        <h1>Dev Space</h1>
        <p>This is where Josh is going to test his shit</p>
        <a href="api/auth/login/facebook" class="btn btn-default"><button>Facebook Login</button></a>
        <button onClick={this.register}>Register Test User</button>
        <button onClick={ this.createTournament }>Create Test Tournament</button>
        <button onClick={ this.getHosted }>Get Hosted</button>
        <button onClick={ this.isLoggedIn }>Is Logged in?</button>
        <button onClick={ this.logout }>Logout</button><h1></h1>

        <button onClick={ this.getUserData }>Get User Data</button>
        <button onClick={ this.clearData }>Clear Database</button><h1></h1>

        <input type="text" placeholder="Player Name" ref="playerName" />
        <button onClick={ this.addPlayer }>Add Player</button>
        <input type="text" placeholder="Tournament ID" ref="tournamentID" /><h1></h1>

        <input type="text" placeholder="Tournament ID" ref="startTournament" />
        <button onClick={ this.startTournament }>Start Tourney</button><h1></h1>

        <input type="text" placeholder="Tournament ID" ref="getTournament" />
        <button onClick={ this.getTournament }>Get Tournament</button><h1></h1>

        <input type="text" placeholder="Player Name" ref="advancePlayer" />
        <button onClick={ this.advancePlayer }>Advance Player</button>
        <input type="text" placeholder="Tournament ID" ref="advanceTourney" /><h1></h1>
      </div>
    );
  }
});

module.exports = Dev;