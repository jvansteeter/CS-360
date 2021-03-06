#include "server.h"

Server::Server(int port) {
    // setup variables
    port_ = port;
    buflen_ = 1024;
    buf_ = new char[buflen_+1];
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
        cout << "SERVER:: handle()" << endl;
        // get a request
        string request = get_request(client);
        // break if client is done or an error occurred
        if (request.empty())
            break;

        Message message = parse_request(request);
        cout << "SERVER:: finished parsing" << endl;

        if (message.needed)
        {
            cout << "SERVER:: needed is true" << endl;
            get_value(client,message);
            cout << "SERVER:: finished get_value()" << endl;
        }
        else
            cout << "SERVER:: needed is false" << endl;
        
        proveHomework(message);

        /* No response sent for HW 1
        // send response
        bool success = send_response(client,request);
        // break if an error occurred
        if (not success)
            break;
        */        
    }
    close(client);
}

string
Server::get_request(int client) {
    string request = "";
    // read until we get a newline
    while (request.find("\n") == string::npos) 
    {
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
    cout << "SERVER:: parse_request()" << endl;
    istringstream iss(request);

    Message message;
    message.command = "";
    message.params[0] = "";
    message.value = "";
    message.needed = false;

    int count = 0;
    
    while(!iss.eof())
    {
        string output;
        getline(iss, output, ' ');
        cout << output << endl;

        if (count == 0)
        {
            message.command = output;
            cout << "SERVER:: command=" << output << endl;
        }
        else if (count == 1)
        {
            message.params[0] = output;
            cout << "SERVER:: params[0]=" << output << endl;
        }
        else if (count == 2)
        {
            message.value = output;
            cout << "SERVER:: value=" << output << endl;
        }
        else
        {
            cout << "SERVER:: CACHING" << endl;
            stringstream cache;
            while (!iss.eof())
            {
                string leftovers;
                getline(iss,leftovers);
                cache << leftovers;
            }
            message.cache = cache.str();
        }

        count++;
    }
    // message is parsed, determine if more is needed
    int value = atoi(message.value.c_str());
    if (value > message.cache.size())
    {
        message.needed = true;
    }

    //request = "Grab the monkey!";

    return message;
}

void Server::get_value(int client, Message message)
{
    cout << "SERVER:: get_value()" << endl;
}

void Server::proveHomework(Message message)
{
    cout << "CLAYTON START" << endl;
    cout << "Params[0]:" + message.params[0] << endl;
    cout << "command:" + message.command << endl;
    cout << "value:" + message.value << endl;
    cout << "CLAYTON END" << endl;

    if (message.command == "store" 
        && message.params[0] != ""
        && message.value != "")
    {
        cout << "Stored a file called " 
        << message.params[0] 
        << " with " 
        << message.value 
        << " bytes." << endl;
    }
    else
    {
        cout << "ERROR:: incorrect syntax" << endl;
    }
}