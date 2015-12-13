var $ = require('jquery');

//
// API
//
var auth = {

    // register a new local user
    register: function(username, password, cb)
    {
        var url = '/api/auth/register';
        var user = {
            username: username,
            password: password
        }
        $.ajax(
        {
            url: url,
            data: user,
            type: 'POST',
            success: function (res)
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
            error: function (xhr, status, err)
            {
                if(cb)
                    cb(false, status);
            }
        });
    },
    // login with a local account
    loginLocal: function(username, password, cb)
    {
        cb = arguments[arguments.length - 1];
        
        if (localStorage.user) 
        {
          this.onChange(true);
          if (cb)
            cb(true);
          return;
        }

        var url = '/api/auth/login/local';
        var user = {
            username: username,
            password: password
        };
        $.ajax(
        {
            url: url,
            data: user,
            type: 'POST',
            success: function (res)
            {
                var url = 'api/user/data';
                $.ajax(
                {
                    url: url,
                    type: 'GET',
                    datatype: 'json',
                    success: function (user) 
                    {
                      // on success, store a login token
                      localStorage.user = user;
                      this.onChange(true);
                      if (cb)
                        cb(true);
                    }.bind(this),
                    error: function (xhr, status, err)
                    {
                      // if there is an error, remove any login token
                      delete localStorage.user;
                      this.onChange(false);
                      if (cb)
                        cb(false);
                    }.bind(this)
                });
            }.bind(this),
            error: function (xhr, status, err)
            {
              // if there is an error, remove any login token
              delete localStorage.user;
              this.onChange(false);
              if (cb)
                cb(false);
            }.bind(this)
        });
    },
    // delete the user token and logout of the session with the server
    logout: function(cb)
    {
        var url = '/api/auth/logout';
        $.ajax(
        {
            url: url,
            type: 'GET',
            success: function (res)
            {
                delete localStorage.user;
                console.log("Logged out user");
                this.onChange(false);
                if (cb) 
                    cb();
            },
            error: function (xhr, status, err)
            {
                if(cb)
                    cb(false, status);
            }
        });
    },
    // check if user is logged in
    loggedIn: function() 
    {
        return !!localStorage.user;
    }.bind(this),
    // on change
    onChange: function() {},
}

module.exports = auth;