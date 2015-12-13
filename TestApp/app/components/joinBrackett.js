//set up react
var React = require("react");
var ReactRouter = require("react-router");



var JoinBrackett = React.createClass({
  render: function() 
  {
	return (
	<div id="join-brackett">
		<h1>Join an Existing Brackett</h1>
		<p>This is where one joins a brackett in the creation stage</p>
		<form>
			<input type="text" placeholder="Tournment Name" ref="tourn-name"/>
			&nbsp;
			<input type="submit" value="Join"/>
		</form>
	</div>
	);
  }
});


module.exports = JoinBrackett;