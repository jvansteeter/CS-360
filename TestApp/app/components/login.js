var React = require("react");
var ReactRouter = require("react-router");
var History = ReactRouter.History;

var auth = require("./auth.js");

// Login page, shows the login form and redirects to the list if login is successful
var Login = React.createClass({
  // mixin for navigation
  mixins: [ History ],

  // initial state
  getInitialState: function() {
    return {
      // there was an error on logging in
      error: false
    };

  },
  //handler for the login
  register: function(event)
  {
    //prevent default brower submit
    event.preventDefault
    //run user registration
    var username = this.refs.registerUsername.value;
    var password = this.refs.registerPassword.value;
    if(!username || !password)
    {
      console.log("Returning: " + username + " " + password);
      return;
    }
    console.log("About to call the api");
    auth.register(username, password, function (success, res)
    {
      if(success)
      {
        console.log(res);
      }
    });
  },
  // handle login button submit
  login: function(event) 
  {
    console.log("Logging in the user locally");
    //prevent default browser submit
    event.preventDefault();
    //get data from form
    var username = this.refs.username.value;
    var password = this.refs.password.value;
    //check for empty submissions
    if(!username || !password)
    {
      console.log("Returning: " + username + " " + password);
      return;
    }

    // login via API
    auth.loginLocal(username, password, function (loggedIn)
    {
      if(!loggedIn)
        return this.setState(
        {
          error: true
        });
      this.history.pushState(null, '/createNew');
    }.bind(this));
  },

  // show the login form
  render: function() {
    return (
    <div id="login-wrapper">
      <div id="login-wrapper-left">
        <h1>Login to an Account</h1>
        <p>If you want to store your stats, you will have to sign in</p>
        <form id="login-form" onSubmit={ this.login }>
          <input type="text" placeholder="Username" ref="username" />
          <input type="password" placeholder="Password" ref="password"/>
          <input type="submit" value="Login" />
        </form>
        or &nbsp;
        <a href="/api/auth/login/facebook"><input type="submit" value="Login with Facebook"/></a>
      </div>
      <div id="login-wrapper-right">
        <h1>Register with BrackAttack</h1>
        <p>If you need an account, start here</p>
        <form id="login-form" onSubmit={ this.register }>
          <input type="text" placeholder="Username" ref="registerUsername" />
          <input type="password" placeholder="Password" ref="registerPassword"/>
          <input type="submit" value="Register" />
        </form>
      </div>
    </div>
    );
  }
});

module.exports = Login;
