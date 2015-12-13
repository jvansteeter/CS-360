webpackJsonp([1],{

/***/ 0:
/*!****************************!*\
  !*** ./components/main.js ***!
  \****************************/
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(/*! react */ 1);
	var ReactDOM = __webpack_require__(/*! react-dom */ 158);
	var ReactRouter = __webpack_require__(/*! react-router */ 159);
	
	var Router = ReactRouter.Router;
	var Route = ReactRouter.Route;
	var IndexRoute = ReactRouter.IndexRoute;
	
	var api = __webpack_require__(/*! ./api.js */ 210);
	var auth = __webpack_require__(/*! ./auth.js */ 230);
	var App = __webpack_require__(/*! ./app.js */ 212);
	var Home = __webpack_require__(/*! ./home.js */ 213);
	var Login = __webpack_require__(/*! ./login.js */ 214);
	var CreateBrackett = __webpack_require__(/*! ./createBrackett.js */ 215);
	var JoinBrackett = __webpack_require__(/*! ./joinBrackett.js */ 216);
	var Dev = __webpack_require__(/*! ./dev.js */ 217);
	var ViewBrackett = __webpack_require__(/*! ./view.js */ 218);
	
	__webpack_require__(/*! ../../~/bootstrap/dist/css/bootstrap.min.css */ 219);
	__webpack_require__(/*! ../css/app.css */ 228);
	
	// Remove the ugly Facebook appended hash
	// <https://github.com/jaredhanson/passport-facebook/issues/12>
	if (window.location.hash && window.location.hash === "#_=_") {
	  // If you are not using Modernizr, then the alternative is:
	  if (window.history && history.replaceState) {
	    window.history.replaceState("", document.title, window.location.pathname);
	    api.getUserData(function (success, user) {
	      if (success) {
	        localStorage.user = user;
	        console.log("Saved the facebook user token for: " + user);
	      }
	    });
	  } else {
	    // Prevent scrolling by storing the page's current scroll offset
	    var scroll = {
	      top: document.body.scrollTop,
	      left: document.body.scrollLeft
	    };
	    window.location.hash = "";
	    // Restore the scroll offset, should be flicker free
	    document.body.scrollTop = scroll.top;
	    document.body.scrollLeft = scroll.left;
	  }
	}
	
	var routes = React.createElement(
	  Router,
	  null,
	  React.createElement(
	    Route,
	    { name: "app", path: "/", component: App },
	    React.createElement(IndexRoute, { component: Home }),
	    React.createElement(Route, { name: "createNew", path: "/createNew", component: CreateBrackett }),
	    React.createElement(Route, { name: "login", path: "/login", component: Login }),
	    React.createElement(Route, { name: "view", path: "/view", component: ViewBrackett }),
	    React.createElement(Route, { name: "join", path: "/join", component: JoinBrackett }),
	    React.createElement(Route, { name: "DEV", path: "/dev", component: Dev })
	  )
	);
	
	ReactDOM.render(routes, document.getElementById('content'));

/***/ },

/***/ 158:
/*!*******************************!*\
  !*** ../~/react-dom/index.js ***!
  \*******************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = __webpack_require__(/*! react/lib/ReactDOM */ 3);


/***/ },

/***/ 210:
/*!***************************!*\
  !*** ./components/api.js ***!
  \***************************/
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(/*! jquery */ 211);
	
	//
	// API
	//
	var api = {
	    // query the database for a tournament with the specified ID
	    getTournament: function (tournamentId, cb) {
	        var url = '/api/tournament/' + tournamentId;
	        $.ajax({
	            url: url,
	            datatype: 'json',
	            type: 'GET',
	            success: function (res) {
	                if (cb) cb(true, res);
	            },
	            error: function (xhr, status, err) {
	                if (cb) cb(false, status);
	            }
	        });
	    },
	    // create a new tournament
	    createTournament: function (title, cb) {
	        var url = 'api/tournament/create';
	        $.ajax({
	            url: url,
	            type: 'POST',
	            data: { title: title },
	            success: function (res) {
	                if (cb) cb(true, res);
	            },
	            error: function (xhr, status, err) {
	                if (cb) cb(false, status);
	            }
	        });
	    },
	    // register a player to an existing !begun tournament.  This can only be done by a tournament host.
	    addPlayer: function (tournament_id, player, cb) {
	        var url = 'api/tournament/' + tournament_id + '/addplayer';
	        $.ajax({
	            url: url,
	            type: 'POST',
	            data: { player: player },
	            success: function (res) {
	                if (cb) cb(true, res);
	            },
	            error: function (xhr, status, err) {
	                if (cb) cb(false, status);
	            }
	        });
	    },
	    // start the tournament, this generates the rounds and matches as well as closes entries
	    startTournament: function (tournament_id, cb) {
	        var url = 'api/tournament/' + tournament_id + '/start';
	        $.ajax({
	            url: url,
	            type: 'GET',
	            datatype: 'json',
	            success: function (res) {
	                if (cb) cb(true, res);
	            },
	            error: function (xhr, status, err) {
	                if (cb) cb(false, status);
	            }
	        });
	    },
	    // advance a player as the winner of a match and move into the next round
	    advancePlayer: function (player, tournament_id, cb) {
	        var url = 'api/tournament/' + tournament_id + '/advance/';
	        $.ajax({
	            url: url,
	            type: 'POST',
	            data: { player: player },
	            success: function (res) {
	                if (cb) cb(true, res);
	            },
	            error: function (xhr, status, err) {
	                if (cb) cb(false, status);
	            }
	        });
	    },
	    // get all tournaments hosted by the logged in user
	    getHosted: function (cb) {
	        var url = 'api/user/hosted';
	        $.ajax({
	            url: url,
	            type: 'GET',
	            datatype: 'json',
	            success: function (res) {
	                if (cb) cb(true, res);
	            },
	            error: function (xhr, status, err) {
	                if (cb) cb(false, status);
	            }
	        });
	    },
	    // get the user data to store as an authenticated token
	    getUserData: function (cb) {
	        var url = 'api/user/data';
	        $.ajax({
	            url: url,
	            type: 'GET',
	            datatype: 'json',
	            success: function (user) {
	                console.log("Successfully logged in locally, saving user: " + user);
	                localStorage.user = user;
	                if (cb) cb(true, user);
	            },
	            error: function (xhr, status, err) {
	                if (cb) cb(false, status);
	            }
	        });
	    }
	};
	
	module.exports = api;

/***/ },

/***/ 212:
/*!***************************!*\
  !*** ./components/app.js ***!
  \***************************/
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(/*! react */ 1);
	var ReactRouter = __webpack_require__(/*! react-router */ 159);
	var History = ReactRouter.History;
	
	var auth = __webpack_require__(/*! ./auth.js */ 230);
	
	// Top-level component for the app
	var App = React.createClass({
	  displayName: "App",
	
	  // mixin for navigation
	  mixins: [History],
	
	  // initial state
	  getInitialState: function () {
	    return {
	      // the user is logged in
	      loggedIn: auth.loggedIn()
	    };
	  },
	
	  // callback when user is logged in
	  setStateOnAuth: function (loggedIn) {
	    this.setState({ loggedIn: loggedIn });
	  },
	
	  // when the component loads, setup the callback
	  componentWillMount: function () {
	    auth.onChange = this.setStateOnAuth;
	  },
	
	  // logout the user and redirect to home page
	  logout: function (event) {
	    auth.logout();
	    this.history.pushState(null, '/');
	  },
	
	  // show the navigation bar
	  // the route handler replaces the RouteHandler element with the current page
	  render: function () {
	    return React.createElement(
	      "div",
	      null,
	      React.createElement(
	        "nav",
	        { className: "navbar navbar-default", role: "navigation" },
	        React.createElement(
	          "div",
	          { className: "container" },
	          React.createElement(
	            "div",
	            { className: "navbar-header" },
	            React.createElement(
	              "button",
	              { type: "button", className: "navbar-toggle", "data-toggle": "collapse", "data-target": "#bs-example-navbar-collapse-1" },
	              React.createElement(
	                "span",
	                { className: "sr-only" },
	                "Toggle navigation"
	              ),
	              React.createElement("span", { className: "icon-bar" }),
	              React.createElement("span", { className: "icon-bar" }),
	              React.createElement("span", { className: "icon-bar" })
	            ),
	            React.createElement(
	              "a",
	              { className: "navbar-brand", href: "/" },
	              "BrackAttack"
	            )
	          ),
	          React.createElement(
	            "div",
	            { className: "collapse navbar-collapse", id: "bs-example-navbar-collapse-1" },
	            this.state.loggedIn ? React.createElement(
	              "ul",
	              { className: "nav navbar-nav" },
	              React.createElement(
	                "li",
	                null,
	                React.createElement(
	                  "a",
	                  { href: "#/createNew" },
	                  "Create Brackett"
	                )
	              ),
	              React.createElement(
	                "li",
	                null,
	                React.createElement(
	                  "a",
	                  { href: "#/view" },
	                  "View Bracketts"
	                )
	              ),
	              React.createElement(
	                "li",
	                null,
	                React.createElement(
	                  "a",
	                  { href: "#/join" },
	                  "Join Brackett"
	                )
	              ),
	              React.createElement(
	                "li",
	                null,
	                React.createElement(
	                  "a",
	                  { href: "#/dev" },
	                  "DEV"
	                )
	              ),
	              React.createElement(
	                "li",
	                null,
	                React.createElement(
	                  "a",
	                  { href: "#", onClick: this.logout },
	                  "Logout"
	                )
	              )
	            ) : React.createElement("div", null)
	          )
	        )
	      ),
	      React.createElement(
	        "div",
	        { className: "container" },
	        this.props.children
	      )
	    );
	  }
	});
	
	module.exports = App;

/***/ },

/***/ 213:
/*!****************************!*\
  !*** ./components/home.js ***!
  \****************************/
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(/*! react */ 1);
	var ReactRouter = __webpack_require__(/*! react-router */ 159);
	
	var Link = ReactRouter.Link;
	
	// Home page, which shows Login and Register buttons
	var Home = React.createClass({
	  displayName: "Home",
	
	  render: function () {
	    return React.createElement(
	      "p",
	      null,
	      React.createElement(
	        Link,
	        { className: "btn btn-default", to: "login" },
	        "Login"
	      )
	    );
	  }
	});
	
	module.exports = Home;

/***/ },

/***/ 214:
/*!*****************************!*\
  !*** ./components/login.js ***!
  \*****************************/
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(/*! react */ 1);
	var ReactRouter = __webpack_require__(/*! react-router */ 159);
	var History = ReactRouter.History;
	
	var auth = __webpack_require__(/*! ./auth.js */ 230);
	
	// Login page, shows the login form and redirects to the list if login is successful
	var Login = React.createClass({
	  displayName: "Login",
	
	  // mixin for navigation
	  mixins: [History],
	
	  // initial state
	  getInitialState: function () {
	    return {
	      // there was an error on logging in
	      error: false
	    };
	  },
	  //handler for the login
	  register: function (event) {
	    //prevent default brower submit
	    event.preventDefault;
	    //run user registration
	    var username = this.refs.registerUsername.value;
	    var password = this.refs.registerPassword.value;
	    if (!username || !password) {
	      console.log("Returning: " + username + " " + password);
	      return;
	    }
	    console.log("About to call the api");
	    auth.register(username, password, function (success, res) {
	      if (success) {
	        console.log(res);
	      }
	    });
	  },
	  // handle login button submit
	  login: function (event) {
	    console.log("Logging in the user locally");
	    //prevent default browser submit
	    event.preventDefault();
	    //get data from form
	    var username = this.refs.username.value;
	    var password = this.refs.password.value;
	    //check for empty submissions
	    if (!username || !password) {
	      console.log("Returning: " + username + " " + password);
	      return;
	    }
	
	    // login via API
	    auth.loginLocal(username, password, (function (loggedIn) {
	      if (!loggedIn) return this.setState({
	        error: true
	      });
	      this.history.pushState(null, '/createNew');
	    }).bind(this));
	  },
	
	  // show the login form
	  render: function () {
	    return React.createElement(
	      "div",
	      { id: "login-wrapper" },
	      React.createElement(
	        "div",
	        { id: "login-wrapper-left" },
	        React.createElement(
	          "h1",
	          null,
	          "Login to an Account"
	        ),
	        React.createElement(
	          "p",
	          null,
	          "If you want to store your stats, you will have to sign in"
	        ),
	        React.createElement(
	          "form",
	          { id: "login-form", onSubmit: this.login },
	          React.createElement("input", { type: "text", placeholder: "Username", ref: "username" }),
	          React.createElement("input", { type: "password", placeholder: "Password", ref: "password" }),
	          React.createElement("input", { type: "submit", value: "Login" })
	        ),
	        "or  ",
	        React.createElement(
	          "a",
	          { href: "/api/auth/login/facebook" },
	          React.createElement("input", { type: "submit", value: "Login with Facebook" })
	        )
	      ),
	      React.createElement(
	        "div",
	        { id: "login-wrapper-right" },
	        React.createElement(
	          "h1",
	          null,
	          "Register with BrackAttack"
	        ),
	        React.createElement(
	          "p",
	          null,
	          "If you need an account, start here"
	        ),
	        React.createElement(
	          "form",
	          { id: "login-form", onSubmit: this.register },
	          React.createElement("input", { type: "text", placeholder: "Username", ref: "registerUsername" }),
	          React.createElement("input", { type: "password", placeholder: "Password", ref: "registerPassword" }),
	          React.createElement("input", { type: "submit", value: "Register" })
	        )
	      )
	    );
	  }
	});
	
	module.exports = Login;

/***/ },

/***/ 215:
/*!**************************************!*\
  !*** ./components/createBrackett.js ***!
  \**************************************/
/***/ function(module, exports, __webpack_require__) {

	//set up react
	var React = __webpack_require__(/*! react */ 1);
	var ReactRouter = __webpack_require__(/*! react-router */ 159);
	var api = __webpack_require__(/*! ./api.js */ 210);
	
	var CreateBrackett = React.createClass({
		displayName: "CreateBrackett",
	
		// create a new tournament
		createTournament: function (event) {
			event.preventDefault();
	
			api.createTournament(this.refs.tourneyName.value, function (success, result) {
				if (success) {
					console.log(result);
				}
			});
		},
	
		//show the Brackett creation form
		render: function () {
			return React.createElement(
				"div",
				{ id: "create-brackett" },
				React.createElement(
					"h1",
					null,
					"Create a new Brackett"
				),
				React.createElement(
					"p",
					null,
					"This is where new bracketts are brought into the world"
				),
				React.createElement(
					"form",
					{ onSubmit: this.createTournament },
					React.createElement("input", { type: "text", placeholder: "Tournment Name", ref: "tourneyName" }),
					" ",
					React.createElement("input", { type: "submit", value: "Create" })
				)
			);
		}
	});
	
	module.exports = CreateBrackett;

/***/ },

/***/ 216:
/*!************************************!*\
  !*** ./components/joinBrackett.js ***!
  \************************************/
/***/ function(module, exports, __webpack_require__) {

	//set up react
	var React = __webpack_require__(/*! react */ 1);
	var ReactRouter = __webpack_require__(/*! react-router */ 159);
	
	var JoinBrackett = React.createClass({
		displayName: "JoinBrackett",
	
		render: function () {
			return React.createElement(
				"div",
				{ id: "join-brackett" },
				React.createElement(
					"h1",
					null,
					"Join an Existing Brackett"
				),
				React.createElement(
					"p",
					null,
					"This is where one joins a brackett in the creation stage"
				),
				React.createElement(
					"form",
					null,
					React.createElement("input", { type: "text", placeholder: "Tournment Name", ref: "tourn-name" }),
					" ",
					React.createElement("input", { type: "submit", value: "Join" })
				)
			);
		}
	});
	
	module.exports = JoinBrackett;

/***/ },

/***/ 217:
/*!***************************!*\
  !*** ./components/dev.js ***!
  \***************************/
/***/ function(module, exports, __webpack_require__) {

	//set up react
	var React = __webpack_require__(/*! react */ 1);
	var ReactRouter = __webpack_require__(/*! react-router */ 159);
	var api = __webpack_require__(/*! ./api.js */ 210);
	var $ = __webpack_require__(/*! jquery */ 211);
	
	var Dev = React.createClass({
		displayName: "Dev",
	
		register: function (event) {
			event.preventDefault();
			var username = "test1";
			var password = "this";
	
			api.registerLocal(username, password, function (success, result) {
				if (success) {
					console.log(result);
				}
			});
		},
		createTournament: function (event) {
			event.preventDefault();
	
			api.createTournament("Test Tournament", function (success, result) {
				if (success) {
					console.log(result);
				}
			});
		},
		getHosted: function (event) {
			event.preventDefault();
	
			api.getHosted(function (success, result) {
				if (success) {
					console.log(JSON.parse(result));
				}
			});
		},
		isLoggedIn: function (event) {
			event.preventDefault();
	
			if (!localStorage.user) {
				console.log("User not logged in");
			} else {
				console.log("Logged In: " + localStorage.user);
			}
		},
		logout: function (event) {
			event.preventDefault();
	
			api.logout(function (success, result) {
				if (success) {
					console.log("<Successfully logged out>: " + result);
				}
			});
		},
		getUserData: function (event) {
			event.preventDefault();
	
			api.getUserData(function (success, result) {
				if (success) {
					console.log("<Successfully retreived user data: " + result);
				}
			});
		},
		clearData: function (event) {
			event.preventDefault();
	
			var url = 'api/clearData';
			$.ajax({
				url: url,
				type: 'GET',
				success: function (res) {
					console.log("Cleared Database of tournaments, rounds, matches, and hosts");
				},
				error: function (xhr, status, err) {
					console.log(status);
				}
			});
		},
		addPlayer: function (event) {
			event.preventDefault();
	
			var playerName = this.refs.playerName.value;
			var tournament_id = this.refs.tournamentID.value;
			api.addPlayer(this.refs.tournamentID.value, playerName, function (success, res) {
				if (success) {
					console.log("Added " + playerName + " to " + tournament_id + " : " + res);
				} else {
					console.log("Adding player Failed miserably.  You suck at life!");
				}
			});
		},
		startTournament: function (event) {
			event.preventDefault();
	
			var tournament_id = this.refs.startTournament.value;
			api.startTournament(tournament_id, function (success, res) {
				if (success) {
					console.log("Started tournament");
				} else {
					console.log("DAMN DAMN DAMN");
				}
			});
		},
		getTournament: function (event) {
			event.preventDefault();
	
			var tournament_id = this.refs.getTournament.value;
			api.getTournament(tournament_id, function (success, tournament) {
				if (success) {
					console.log(JSON.parse(tournament));
				}
			});
		},
		advancePlayer: function (event) {
			event.preventDefault();
	
			var player = this.refs.advancePlayer.value;
			var tournament_id = this.refs.advanceTourney.value;
			api.advancePlayer(player, tournament_id, function (success, res) {
				if (success) {
					console.log(res);
				}
			});
		},
	
		render: function () {
			return React.createElement(
				"div",
				null,
				React.createElement(
					"h1",
					null,
					"Dev Space"
				),
				React.createElement(
					"p",
					null,
					"This is where Josh is going to test his shit"
				),
				React.createElement(
					"a",
					{ href: "api/auth/login/facebook", "class": "btn btn-default" },
					React.createElement(
						"button",
						null,
						"Facebook Login"
					)
				),
				React.createElement(
					"button",
					{ onClick: this.register },
					"Register Test User"
				),
				React.createElement(
					"button",
					{ onClick: this.createTournament },
					"Create Test Tournament"
				),
				React.createElement(
					"button",
					{ onClick: this.getHosted },
					"Get Hosted"
				),
				React.createElement(
					"button",
					{ onClick: this.isLoggedIn },
					"Is Logged in?"
				),
				React.createElement(
					"button",
					{ onClick: this.logout },
					"Logout"
				),
				React.createElement("h1", null),
				React.createElement(
					"button",
					{ onClick: this.getUserData },
					"Get User Data"
				),
				React.createElement(
					"button",
					{ onClick: this.clearData },
					"Clear Database"
				),
				React.createElement("h1", null),
				React.createElement("input", { type: "text", placeholder: "Player Name", ref: "playerName" }),
				React.createElement(
					"button",
					{ onClick: this.addPlayer },
					"Add Player"
				),
				React.createElement("input", { type: "text", placeholder: "Tournament ID", ref: "tournamentID" }),
				React.createElement("h1", null),
				React.createElement("input", { type: "text", placeholder: "Tournament ID", ref: "startTournament" }),
				React.createElement(
					"button",
					{ onClick: this.startTournament },
					"Start Tourney"
				),
				React.createElement("h1", null),
				React.createElement("input", { type: "text", placeholder: "Tournament ID", ref: "getTournament" }),
				React.createElement(
					"button",
					{ onClick: this.getTournament },
					"Get Tournament"
				),
				React.createElement("h1", null),
				React.createElement("input", { type: "text", placeholder: "Player Name", ref: "advancePlayer" }),
				React.createElement(
					"button",
					{ onClick: this.advancePlayer },
					"Advance Player"
				),
				React.createElement("input", { type: "text", placeholder: "Tournament ID", ref: "advanceTourney" }),
				React.createElement("h1", null)
			);
		}
	});
	
	module.exports = Dev;

/***/ },

/***/ 218:
/*!****************************!*\
  !*** ./components/view.js ***!
  \****************************/
/***/ function(module, exports, __webpack_require__) {

	//set up react
	var React = __webpack_require__(/*! react */ 1);
	var ReactRouter = __webpack_require__(/*! react-router */ 159);
	
	var api = __webpack_require__(/*! ./api.js */ 210);
	
	var ViewBracketts = React.createClass({
		displayName: "ViewBracketts",
	
		getInitialState: function () {
			console.log("running views getInitialState");
			return { items: JSON.parse("[{}]") };
		},
	
		componentDidMount: function () {
			console.log("running view componentDidMount");
			api.getHosted(this.listSet);
		},
	
		load: function () {
			console.log("running LOAD");
			api.getHosted(this.listSet);
		},
	
		listSet: function (status, data) {
			console.log("running listSet");
			if (status) {
				console.log("running listSet TRUE");
				this.setState({
					items: JSON.parse(data)
				});
			} else {
				console.log("running listSet FALSE");
				this.context.router.transitionTo('/createNew');
			}
		},
	
		render: function () {
			console.log("running view Render");
	
			return React.createElement(
				"div",
				null,
				React.createElement(
					"h1",
					null,
					"View Logged in Users Bracketts"
				),
				React.createElement(
					"p",
					null,
					"This is where the magic happens"
				),
				this.state.items[0].title
			);
		}
	});
	
	module.exports = ViewBracketts;

/***/ },

/***/ 219:
/*!*************************************************!*\
  !*** ../~/bootstrap/dist/css/bootstrap.min.css ***!
  \*************************************************/
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },

/***/ 228:
/*!*********************!*\
  !*** ./css/app.css ***!
  \*********************/
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },

/***/ 230:
/*!****************************!*\
  !*** ./components/auth.js ***!
  \****************************/
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(/*! jquery */ 211);
	
	//
	// API
	//
	var auth = {
	
	    // register a new local user
	    register: function (username, password, cb) {
	        var url = '/api/auth/register';
	        var user = {
	            username: username,
	            password: password
	        };
	        $.ajax({
	            url: url,
	            data: user,
	            type: 'POST',
	            success: function (res) {
	                var url = 'api/user/data';
	                $.ajax({
	                    url: url,
	                    type: 'GET',
	                    datatype: 'json',
	                    success: function (user) {
	                        console.log("Successfully logged in locally, saving user: " + user);
	                        localStorage.user = user;
	                        if (cb) cb(true, user);
	                    },
	                    error: function (xhr, status, err) {
	                        if (cb) cb(false, status);
	                    }
	                });
	            },
	            error: function (xhr, status, err) {
	                if (cb) cb(false, status);
	            }
	        });
	    },
	    // login with a local account
	    loginLocal: function (username, password, cb) {
	        cb = arguments[arguments.length - 1];
	
	        if (localStorage.user) {
	            this.onChange(true);
	            if (cb) cb(true);
	            return;
	        }
	
	        var url = '/api/auth/login/local';
	        var user = {
	            username: username,
	            password: password
	        };
	        $.ajax({
	            url: url,
	            data: user,
	            type: 'POST',
	            success: (function (res) {
	                var url = 'api/user/data';
	                $.ajax({
	                    url: url,
	                    type: 'GET',
	                    datatype: 'json',
	                    success: (function (user) {
	                        // on success, store a login token
	                        localStorage.user = user;
	                        this.onChange(true);
	                        if (cb) cb(true);
	                    }).bind(this),
	                    error: (function (xhr, status, err) {
	                        // if there is an error, remove any login token
	                        delete localStorage.user;
	                        this.onChange(false);
	                        if (cb) cb(false);
	                    }).bind(this)
	                });
	            }).bind(this),
	            error: (function (xhr, status, err) {
	                // if there is an error, remove any login token
	                delete localStorage.user;
	                this.onChange(false);
	                if (cb) cb(false);
	            }).bind(this)
	        });
	    },
	    // delete the user token and logout of the session with the server
	    logout: function (cb) {
	        var url = '/api/auth/logout';
	        $.ajax({
	            url: url,
	            type: 'GET',
	            success: function (res) {
	                delete localStorage.user;
	                console.log("Logged out user");
	                this.onChange(false);
	                if (cb) cb();
	            },
	            error: function (xhr, status, err) {
	                if (cb) cb(false, status);
	            }
	        });
	    },
	    // check if user is logged in
	    loggedIn: (function () {
	        return !!localStorage.user;
	    }).bind(this),
	    // on change
	    onChange: function () {}
	};
	
	module.exports = auth;

/***/ }

});
//# sourceMappingURL=app.js.map