//set up react
var React = require("react");
var ReactRouter = require("react-router");
var api = require('./api.js');

var CreateBrackett = React.createClass({
	// create a new tournament
	createTournament: function(event)
	{
		event.preventDefault();

		api.createTournament(this.refs.tourneyName.value, function (success, result)
		{
			if(success)
			{
				console.log(result);
			}
		});
	},


	//show the Brackett creation form
  render: function() 
  {
	return (
	<div id="create-brackett">
		<h1>Create a new Brackett</h1>
		<p>This is where new bracketts are brought into the world</p>
		<form onSubmit={ this.createTournament }>
			<input type="text" placeholder="Tournment Name" ref="tourneyName"/>
			&nbsp;
			<input type="submit" value="Create"/>
		</form>
	</div>
    );
  }
});

module.exports = CreateBrackett;