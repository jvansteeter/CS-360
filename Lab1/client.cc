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
        if(debug)
            cout << "CLIENT:: parsing finished" << endl;
        
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

string
Client::get_response() 
{
    string response = "";
    // read until we get a newline
    while (response.find("\n") == string::npos) 
    {
        if(debug)
            cout << "CLIENT:: get_response()" << endl;
        int nread = recv(server_,buf_,1024,0);
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
        response.append(buf_,nread);
        if(debug)
            cout << "CLIENT:: response=" << response << endl;
    }
    // a better client would cut off anything after the newline and
    // save it in a cache
    if (debug)
        cout << response;
    return response;
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
            string user;
            getline(iss, user, ' ');

            if(user.size() > 0)
                list_command(user);
            else
                error = true;
            if(debug)
                cout << "CLIENT:: listing messages for "
                    << user << endl;
            return "list";
        }

// Read Command
        else if (argument == "read")
        {
            string user, index_string;
            int index;
            getline(iss, user, ' ');
            getline(iss, index_string, ' ');
            index = atoi(index_string.c_str());

            if(user.size() > 0)
                read_command(user, index);
            else
                error = true;
            if(debug)
                cout << "CLIENT:: reading message for "
                    << user << " at index " << index << endl;
            return "read";
        }

// Reset Command
        else if (argument == "reset")
        {
            send_request("reset\n");
            if(debug)
                cout << "CLIENT:: reseting server" << endl;
            return "reset";
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
        cout << "CLIENT:: send_command()" << endl;

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
    if (not success)
        cout << "error: message not sent" << endl;

    string response = get_response();
    if(debug)
        cout << "CLIENT:: response received" << endl;
    // break if an error occurred
    if (response == "")
    {
        cout << "error: no response received" << endl;
    }
}

void Client::list_command(string user)
{
    if(debug)
        cout << "CLIENT:: list_command()" << endl;
    string request = "list " + user + "\n";

    bool success = send_request(request);
    // break if an error occurred
    if (not success)
        cout << "error: message not sent" << endl;
    // get response
    string response = get_response();
    if(debug)
        cout << "CLIENT:: response received" << endl;
    // break if an error occurred
    if (response == "")
    {
        cout << "error: no response received" << endl;
        return;
    }
    cout << response << endl;
}

void Client::read_command(string user, int index)
{
    if(debug)
        cout << "CLIENT:: read_command()" << endl;
    stringstream ss; 
    ss << "get " << user << " " << index << "\n";
    string request = ss.str();

    bool success = send_request(request);
    // break if an error occurred
    if (not success)
        cout << "error: message not sent" << endl;
    // get response
    string response = get_response();
    if(debug)
        cout << "CLIENT:: response received" << endl;
    // break if an error occurred
    if(response == "")
    {
        cout << "error: no response received" << endl;
        return;
    }

    // Response from the server has meta data that needs to be parsed
    if(debug)
        cout << "CLIENT:: parse read response" << endl;
    istringstream iss(response);

    while(!iss.eof())
    {
        string arg, command;
        getline(iss, arg, '\n');
        istringstream arg_line(arg);
        getline(arg_line, command, ' ');
        // the only command should be the message command
        if(command == "message")
        {
            string subject, length;
            getline(arg_line, subject, ' ');
            getline(arg_line, length, ' ');

            stringstream ss;
            while(!iss.eof())
            {
                string line;
                getline(iss,line);
                if(debug)
                    cout << "CLIENT:: parsing> " << line << endl;
                ss << line << '\n';
            }
            string email = ss.str();
            // print message
            cout << subject << endl
                << email;
        }
        else
        {
            cout << "error: received unexpected message from server" << endl;
        }
    }
}