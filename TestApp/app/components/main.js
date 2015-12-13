var React = require("react");
var ReactDOM = require('react-dom');
var ReactRouter = require("react-router");

var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var IndexRoute = ReactRouter.IndexRoute;

var api = require('./api.js');
var auth = require('./auth.js');
var App = require("./app.js");
var Home = require("./home.js");
var Login = require("./login.js");
var CreateBrackett = require('./createBrackett.js');
var JoinBrackett = require("./joinBrackett.js");
var Dev = require("./dev.js");
var ViewBrackett = require('./view.js');

require("../../node_modules/bootstrap/dist/css/bootstrap.min.css");
require("../css/app.css");

// Remove the ugly Facebook appended hash
// <https://github.com/jaredhanson/passport-facebook/issues/12>
if (window.location.hash && window.location.hash === "#_=_") 
{
  // If you are not using Modernizr, then the alternative is:
  if (window.history && history.replaceState) 
  {
    window.history.replaceState("", document.title, window.location.pathname);
    api.getUserData(function (success, user)
    {
      if(success)
      {
        localStorage.user = user;
        console.log("Saved the facebook user token for: " + user);
      }
    });
  } 
  else 
  {
    // Prevent scrolling by storing the page's current scroll offset
    var scroll = 
    {
      top: document.body.scrollTop,
      left: document.body.scrollLeft
    };
    window.location.hash = "";
    // Restore the scroll offset, should be flicker free
    document.body.scrollTop = scroll.top;
    document.body.scrollLeft = scroll.left;
  }
}

var routes = (
  <Router>
    <Route name="app" path="/" component ={App}>
      <IndexRoute component = {Home} />
      <Route name="createNew" path="/createNew" component={CreateBrackett} />
      <Route name="login" path="/login" component={Login}/>
      <Route name="view" path="/view" component={ViewBrackett}/>
      <Route name="join" path="/join" component={JoinBrackett}  />
      <Route name="DEV" path="/dev" component={Dev}/>
    </Route>
  </Router>
);

ReactDOM.render(routes, document.getElementById('content'));
