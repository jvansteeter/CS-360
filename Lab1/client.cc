#include "client.h"

Client::Client(string host, int port, bool d) {
    // setup variables
    host_ = host;
    port_ = port;
    buflen_ = 1024;
    buf_ = new char[buflen_+1];
    debug = d;
}

Client::~Client() {
}

void Client::run() {
    // connect to the server and run echo program
    create();
    protocol();
}

void
Client::create() {
    struct sockaddr_in server_addr;

    // use DNS to get IP address
    struct hostent *hostEntry;
    hostEntry = gethostbyname(host_.c_str());
    if (!hostEntry) {
        cout << "No such host name: " << host_ << endl;
        exit(-1);
    }

    // setup socket address structure
    memset(&server_addr,0,sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(port_);
    memcpy(&server_addr.sin_addr, hostEntry->h_addr_list[0], hostEntry->h_length);

    // create socket
    server_ = socket(PF_INET,SOCK_STREAM,0);
    if (!server_) {
        perror("socket");
        exit(-1);
    }

    // connect to server
    if (connect(server_,(const struct sockaddr *)&server_addr,sizeof(server_addr)) < 0) {
        perror("connect");
        exit(-1);
    }
}

void
Client::close_socket() {
    close(server_);
}

void
Client::protocol() {
    string line;
    bool running = true;
    
    // loop to handle user interface
    while (running) 
    {
        // mark the consol
        cout << "% ";
        getline(cin, line);
        // parse the command
        string command = parse_command(line);
        // append a newline
        //line += "\n";

        /*
        // send request
        bool success = send_request(line);
        // break if an error occurred
        if (not success)
            break;
        */
        // get a response
        bool success = get_response();
        // break if an error occurred
        if (not success)
            break;
        
        if (command == "quit")
            running = false;
    }
    close_socket();
}

bool
Client::send_request(string request) {
    // prepare to send request
    const char* ptr = request.c_str();
    int nleft = request.length();
    int nwritten;
    // loop to be sure it is all sent
    while (nleft) {
        if ((nwritten = send(server_, ptr, nleft, 0)) < 0) {
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

bool
Client::get_response() {
    string response = "";
    // read until we get a newline
    while (response.find("\n") == string::npos) {
        int nread = recv(server_,buf_,1024,0);
        if (nread < 0) {
            if (errno == EINTR)
                // the socket call was interrupted -- try again
                continue;
            else
                // an error occurred, so break out
                return false;
        } else if (nread == 0) {
            // the socket is closed
            return false;
        }
        // be sure to use append in case we have binary data
        response.append(buf_,nread);
    }
    // a better client would cut off anything after the newline and
    // save it in a cache
    if (debug)
        cout << response;
    return true;
}

string Client::parse_command(string command)
{
    if(debug)
        cout << "CLIENT:: parse_command()" << endl;

    istringstream iss(command);
    bool error = false;
    while(!iss.eof())
    {
        string argument;
        getline(iss, argument, ' ');

// Send command
        if (argument == "send")
        {
            string user, subject;
            getline(iss, user, ' ');
            getline(iss, subject, ' ');

            if (user.size() > 0)
                send_command(user,subject);
            else
                error = true;

            if(debug)
                cout << "CLIENT:: sending message to "
                    << user << " " << subject << endl;
            return "send";
        }

// List Command
        else if (argument == "list")
        {

            return "list";
        }

// Read Command
        else if (argument == "read")
        {

            return "read";
        }

// Quit command
        else if (argument == "quit")
        {
            return "quit";
        }

// The error case
        else
        {
            error = true;
        }

        if (error)
        {
            cout << "ERROR:: incorrect syntax or command" << endl;
            break;
        }
    }
    return "error";
}

void Client::send_command(string user, string subject)
{
    if (debug)
        cout << "CLIENT:: sendCommand()" << endl;

    stringstream message;
    cout << "- Type your message. End with a blank line -" << endl;

    string line;
    while(getline(cin, line))
    {
        if (line.size() > 0)
        {
            message << line << '\n';
        }
        else
            break;
    }

    // compile protocol request
    string message_string = message.str();
    int message_size = message_string.size();
    stringstream request; 
    request << "put " << user << " " << subject 
        << " " << message_size << "\n"
        << message_string;

    // send message
     bool success = send_request(request.str());
    // break if an error occurred
    //if (not success)
        //break;

    // get a response
    //success = get_response();
    // break if an error occurred
    //if (not success)
        //sbreak;
}

void Client::list_command(string user)
{

}

void Client::read_command(string user, int index)
{

}