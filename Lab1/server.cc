#include "server.h"

Server::Server(int port, bool d) {
    // setup variables
    port_ = port;
    buflen_ = 1024;
    buf_ = new char[buflen_+1];
    debug =d;
}

Server::~Server() {
    delete buf_;
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
Server::close_socket() {
    close(server_);
}

void
Server::serve() {
    // setup client
    int client;
    struct sockaddr_in client_addr;
    socklen_t clientlen = sizeof(client_addr);

      // accept clients
    while ((client = accept(server_,(struct sockaddr *)&client_addr,&clientlen)) > 0) {

        handle(client);
    }
    close_socket();
}

void
Server::handle(int client) {
    // loop to handle all requests
    while (1) 
    {
        if (debug)
            cout << "SERVER:: handle()" << endl;
        // get a request
        string request = get_request(client);
        // break if client is done or an error occurred
        if (request.empty())
            break;

        if (debug)
            cout << request << endl;

        Message message = parse_request(request);
        if (debug)
            cout << "SERVER:: finished parsing" << endl;

        // if more of the message is needed
        if (message.needed)
            get_value(client,message);
        
        // run the commands
        bool success;
        if (message.command == "put")
        {
            success = send_response(client,put_command(message));
        }

       
        
        // break if an error occurred
        if (not success)
            break;
        
              
    }
    close(client);
}

string
Server::get_request(int client) {
    string request = "";
    // read until we get a newline
    while (request.find("\n") == string::npos) 
    {
        if (debug)
            cout << "SERVER:: get_request()" << endl;
        int nread = recv(client,buf_,1024,0);
        if (nread < 0) {
            if (errno == EINTR)
                // the socket call was interrupted -- try again
                continue;
            else
                // an error occurred, so break out
                return "";
        } else if (nread == 0) {
            // the socket is closed
            return "";
        }
        // be sure to use append in case we have binary data
        request.append(buf_,nread);
    }
    // a better server would cut off anything after the newline and
    // save it in a cache
    return request;
}

bool
Server::send_response(int client, string response) {
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
    return true;
}

Message 
Server::parse_request(string request)
{
    if (debug)
        cout << "SERVER:: parse_request()" << endl;
    istringstream iss(request);
    Message message;

    while(!iss.eof())
    {
        string arg;
        getline(iss, arg, ' ');

// Put command
        if (arg == "put")
        {
            string name, subject, length, cache;
            getline(iss, name, ' ');
            getline(iss, subject, ' ');
            getline(iss, length, ' ');
            
            stringstream ss;
            while(!iss.eof())
            {
                string line;
                getline(iss,line);
                ss << line << "\n";
            }
            string remainder = ss.str();

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
        }
    }

    return message;
}

void Server::get_value(int client, Message message)
{
    if (debug)
        cout << "SERVER:: get_value()" << endl;

    string request = message.cache;
    // read until we get a newline
    while (message.value > request.size()) 
    {
        int nread = recv(client,buf_,1024,0);
        if (nread < 0) 
        {
            if (errno == EINTR)
                // the socket call was interrupted -- try again
                continue;
            else
                // an error occurred, so break out
                if (debug)
                    cout << "SERVER:: an error occured" << endl;
                break;
        } 
        else if (nread == 0) 
        {
            if (debug)
                cout << "SERVER:: error: socket closed" << endl;
            // the socket is closed
            break;
        }
        // be sure to use append in case we have binary data
        request.append(buf_,nread);
    }
    message.cache = request;

    if (debug)
        cout << "SERVER:: completed get_value()" << endl;
}

string Server::put_command(Message message)
{
    string name = message.params[0];
    string subject = message.params[1];
    string email = message.cache;

    map<string,vector<map<string, string> > >::iterator it;
    it = data.find(name);
    if (it == data.end())
    {
        //pair<string, string> sub_pair(subject, message.cache);
        map<string, string> user_message;
        user_message.insert(pair<string,string>(subject,email));
        vector<map<string, string> > user_messages;
        user_messages.push_back(user_message);
        pair<string, vector<map<string, string> > > user_account(name, user_messages);
        data.insert(user_account);
    }
    else
    {
        //pair<string, string> sub_pair(subject, message.cache);
        //it->second.insert(sub_pair);
    }
    return "OK";
}