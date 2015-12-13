//set up react
var React = require("react");
var ReactRouter = require("react-router");

var api = require("./api.js");

var ViewBracketts = React.createClass({


	getInitialState: function()
	{
		console.log("running views getInitialState");
		return { items: JSON.parse("[{}]") };
	},

	componentDidMount: function()
	{
		console.log("running view componentDidMount");
		api.getHosted(this.listSet);
	},

	load: function()
	{
		console.log("running LOAD");
		api.getHosted(this.listSet);
	},

	listSet: function(status, data)
	{
		console.log("running listSet");
		if(status)
		{
			console.log("running listSet TRUE");
			this.setState({
				items: JSON.parse(data)
			});
		}
		else
		{
			console.log("running listSet FALSE");
			this.context.router.transitionTo('/createNew');
		}
	},


  render: function() 
  {
  	console.log("running view Render");

	return (
	<div>
		<h1>View Logged in Users Bracketts</h1>
		<p>This is where the magic happens</p>

		{this.state.items[0].title}
	</div>
	);
  }
});


module.exports = ViewBracketts;