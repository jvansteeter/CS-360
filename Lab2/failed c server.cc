#include "server.h"

Server::Server(int port, bool d) {
    // setup variables
    port_ = port;
    buflen_ = 1024;
    //buf_ = new char[buflen_+1];
    debug =d;
}

Server::~Server() {
    //delete buf_;
}

void
Server::run() {
    // create and run the server
    create();
    serve();
}

void
Server::create() {
    if (debug)
        cout << "SERVER:: create()" << endl;
    struct sockaddr_in server_addr;

    // setup socket address structure
    memset(&server_addr,0,sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(port_);
    server_addr.sin_addr.s_addr = INADDR_ANY;

    // create socket
    server_ = socket(PF_INET,SOCK_STREAM,0);
    if (!server_) {
        perror("socket");
        exit(-1);
    }

    // set socket to immediately reuse port when the application closes
    int reuse = 1;
    if (setsockopt(server_, SOL_SOCKET, SO_REUSEADDR, &reuse, sizeof(reuse)) < 0) {
        perror("setsockopt");
        exit(-1);
    }

    // call bind to associate the socket with our local address and
    // port
    if (bind(server_,(const struct sockaddr *)&server_addr,sizeof(server_addr)) < 0) {
        perror("bind");
        exit(-1);
    }

    // convert the socket to listen for incoming connections
    if (listen(server_,SOMAXCONN) < 0) {
        perror("listen");
        exit(-1);
    }
}

void
Server::close_socket() 
{
    if(debug)
        cout << "SERVER:: close_socket()" << endl;
    close(server_);
}

void
Server::serve() 
{
    // setup client
    int client;
    struct sockaddr_in client_addr;
    socklen_t clientlen = sizeof(client_addr);

      // accept clients
    while ((client = accept(server_,(struct sockaddr *)&client_addr,&clientlen)) > 0) 
    {
        if(debug)
            cout << "SERVER:: serve()" << endl;
        handle(client, data, debug);
    }
    close_socket();
}

void
handle(int client, Database &data, bool debug) {
    // loop to handle all requests
    while (1) 
    //for(unsigned int i = 0; i < 1; i++)
    {
        if (debug)
            cout << "SERVER:: handle()" << endl;
        // get a request
        string request = get_request(client, debug);
        // break if client is done or an error occurred
        if (request.empty())
            break;

        if (debug)
            cout << request << endl;

        Message message = parse_request(request, debug);
        if (debug)
            cout << "SERVER:: finished parsing" << endl;

        // if more of the message is needed
        if (message.needed)
            get_value(client, message, debug);
        //else
            //message.cache.append("\n");

        // run the commands
        bool success;
        if (message.command == "put")
        {
            success = send_response(client,put_command(message, data, debug));
        }
        else if(message.command == "list")
        {
            success = send_response(client,list_command(message, data, debug));
        }
        else if(message.command == "get")
        {
            success = send_response(client,get_command(message, data, debug));
        }
        else if(message.command == "reset")
        {
            success = send_response(client,reset_command(message, data, debug));
        }
        else
        {
            success = send_response(client,"error invalid command\n", debug);
        }
        // break if an error occurred
        if (not success)
            break;     
   }
    close(client);
}

string
get_request(int client, bool debug) {
    string request = "";
    char* buf_ = new char[buflen_+1];
    // read until we get a newline
    //while (request.find("\n") == string::npos) 
    {
        if (debug)
            cout << "SERVER:: get_request()" << endl;
        int nread = recv(client,buf_,1024,0);
        if (nread < 0) {
            if (errno == EINTR)
            {
                // the socket call was interrupted -- try again
                //continue;
            }
            else
            {
                // an error occurred, so break out
                delete buf_;
                return "";
            }
        } 
        else if (nread == 0) {
            // the socket is closed
            delete buf_;
            return "";
        }
        // be sure to use append in case we have binary data
        request.append(buf_,nread);
    }
    // a better server would cut off anything after the newline and
    // save it in a cache
    delete buf_;
    return request;
}

bool
send_response(int client, string response, bool debug) 
{
    if(debug)
        cout << "SERVER:: send_response()=" << response << endl;
    // prepare to send response
    const char* ptr = response.c_str();
    int nleft = response.length();
    int nwritten;
    // loop to be sure it is all sent
    while (nleft) {
        if ((nwritten = send(client, ptr, nleft, 0)) < 0) {
            if (errno == EINTR) {
                // the socket call was interrupted -- try again
                continue;
            } else {
                // an error occurred, so break out
                perror("write");
                return false;
            }
        } else if (nwritten == 0) {
            // the socket is closed
            return false;
        }
        nleft -= nwritten;
        ptr += nwritten;
    }
    if(debug)
        cout << "SERVER:: response sent" << endl;
    return true;
}

Message 
parse_request(string request, bool debug)
{
    if (debug)
        cout << "SERVER:: parse_request()" << endl;
    istringstream iss(request);
    Message message;

    try
    {
        while(!iss.eof())
        {
            string arg, command;
            // start with the error case, if it is a good case error will get overwriten
            //message.command = "error";
            getline(iss, arg, '\n');
            istringstream arg_line(arg);
            getline(arg_line, command, ' ');
    // put command
            if (command == "put")
            {
                string name, subject, length, cache;
                getline(arg_line, name, ' ');
                getline(arg_line, subject, ' ');
                getline(arg_line, length, ' ');

                if(name == "" || subject == "" || length == "")
                {
                    message.command = "error";
                    message.needed = false;
                    return message;
                }
                
                stringstream ss;
                bool start = true;
                while(!iss.eof())
                {
                    if(start)
                        start = false;
                    else
                        ss << '\n';
                    string line;
                    getline(iss,line);
                    if(debug)
                        cout << "SERVER:: parsing> " << line << endl;
                    ss << line;// << "\n";
                }
                string remainder = ss.str();

                if(debug)
                    cout << "SERVER:: remainder=" << remainder << endl;

                message.command = "put";
                message.params[0] = name;
                message.params[1] = subject;
                int value = atoi(length.c_str());
                message.value = value;
                
                if (remainder.size() > 0)
                    message.cache = remainder;
                if (value > remainder.size())
                    message.needed = true;
                else
                    message.needed = false;

                if (debug)
                    cout << message.toString();
                return message;
            }
    // list command        
            if (command == "list")
            {
                string name;
                getline(arg_line, name, ' ');

                if(name == "")
                {
                    message.command = "error";
                    message.needed = false;
                    return message;
                }

                message.command = "list";
                message.params[0] = name;
                message.value = 0;
                message.needed = false;
                message.cache = "";

                if(debug)
                    cout << message.toString();
                return message;
            }
    // get command       
            if (command == "get")
            {
                string name, index_string;
                getline(arg_line, name, ' ');
                getline(arg_line, index_string, ' ');

                if(name == "" || index_string == "" || index_string == "0")
                {
                    message.command = "error";
                    message.needed = false;
                    return message;
                }

                message.command = "get";
                message.params[0] = name;
                message.params[1] = index_string;
                message.value = 0;
                message.needed = false;
                message.cache = "";

                if(debug)
                    cout << message.toString();
                return message;
            }
    // reset command
            if (command == "reset")
            {
                message.command = "reset";
                message.params[0] = "";
                message.params[1] = "";
                message.value = 0;
                message.needed = false;
                message.cache = "";
                return message;
            }
    // default case
            message.command = "error";
            message.needed = false;
        }
    } 
    catch(exception& e)
    {
        message.command = "error";
        message.needed = false;
    }
    return message;
}

void get_value(int client, Message & message, bool debug)
{
    if (debug)
        cout << "SERVER:: get_value()" << endl;

    string request = message.cache;
    // read until we get a newline
    while (message.value > request.size()) 
    {
        string cache = get_request(client);
        request.append(cache);
        if(debug)
            cout << "SERVER:: caching-> " << cache;
    }
    message.cache = request;// + "\n";

    if (debug)
    {
        cout << "SERVER:: cache=" << message.cache << endl;
        cout << "SERVER:: completed get_value()" << endl;
    }

}

string put_command(Message message, Database &data, bool debug)
{
    if(debug)
        cout << "SERVER:: put_command()" << endl;
    return data.put_command(message);
    /*
    string name = message.params[0];
    string subject = message.params[1];
    string email = message.cache;

    map<string,vector<pair<string, string> > >::iterator it;
    it = data.find(name);
    if (it == data.end())
    {
        pair<string,string> user_message(subject,email);
        vector<pair<string, string> > user_messages;
        user_messages.push_back(user_message);
        pair<string, vector<pair<string, string> > > user_account(name, user_messages);
        data.insert(user_account);
    }
    else
    {
        it->second.push_back(pair<string,string>(subject,email));
    }
    return "OK\n";
    */
}

string list_command(Message message, Database &data, bool debug)
{
    if(debug)
        cout << "SERVER:: list_command()" << endl;
    return data.list_command(message);
    /*
    string name = message.params[0];
    map<string,vector<pair<string, string> > >::iterator it;
    it = data.find(name);

    string response;
    if(it == data.end())
    {
        response = "list 0\n";
    }
    else
    {
        stringstream ss;
        ss << "list " << it->second.size() << "\n";
        for (unsigned int i = 0; i < it->second.size(); i++)
        {
            ss << (i + 1) << " " << it->second[i].first << "\n";
        }
        response = ss.str();
    }
    return response;
    */
}

string get_command(Message message, Database &data, bool debug)
{
    if(debug)
        cout << "SERVER:: get_command()" << endl;
    return data.get_command(message);
    /*
    string name = message.params[0];
    string index_string = message.params[1];
    int index = atoi(index_string.c_str()) - 1;
    map<string,vector<pair<string, string> > >::iterator it;
    it = data.find(name);

    string response;
    if(it == data.end())
    {
        response = "error there is no message for that use at that index\n";
    }
    else
    {
        //test for the index out of bounds
        if(index + 1 > it->second.size())
            return "error out of bounds index\n";
        stringstream ss;
        string subject = it->second[index].first;
        string email = it->second[index].second;
        int length = email.size();
        ss << "message " << subject << " " << length << "\n"
            << email;

        response = ss.str();
    }
    return response;
    */
}

string reset_command(Message message, Database &data, bool debug)
{
    if(debug)
        cout << "SERVER:: reset_command()" << endl;
    // create new database
    return data.reset_command();
    /*
    data.clear();
    return "OK\n";
    */
}