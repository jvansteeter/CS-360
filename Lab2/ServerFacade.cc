#include "ServerFacade.h"

ServerFacade::ServerFacade(Database* da, bool d)
{
	//client = c;
	data = da;
	debug = d;
}

ServerFacade::~ServerFacade()
{
}

void
ServerFacade::handle(int client) {
    // loop to handle all requests
    //while (1) 
    for(unsigned int i = 0; i < 1; i++)
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
            get_value(client, message);
        //else
            //message.cache.append("\n");

        // run the commands
        bool success;
        if (message.command == "put")
        {
            success = send_response(client,put_command(message));
        }
        else if(message.command == "list")
        {
            success = send_response(client,list_command(message));
        }
        else if(message.command == "get")
        {
            success = send_response(client,get_command(message));
        }
        else if(message.command == "reset")
        {
            success = send_response(client,reset_command(message));
        }
        else
        {
            success = send_response(client,"error invalid command\n");
        }
        // break if an error occurred
        if (not success)
            break;     
   }
    close(client);
}

string
ServerFacade::get_request(int client) 
{
    string request = "";
    int buflen_ = 1024;
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
ServerFacade::send_response(int client, string response) 
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
ServerFacade::parse_request(string request)
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

void 
ServerFacade::get_value(int client, Message & message)
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
    message.cache = request;

    if (debug)
    {
        cout << "SERVER:: cache=" << message.cache << endl;
        cout << "SERVER:: completed get_value()" << endl;
    }

}

string 
ServerFacade::put_command(Message message)
{
    if(debug)
        cout << "SERVER:: put_command()" << endl;
    return data->put_command(message);
}

string 
ServerFacade::list_command(Message message)
{
    if(debug)
        cout << "SERVER:: list_command()" << endl;
    return data->list_command(message);
}

string 
ServerFacade::get_command(Message message)
{
    if(debug)
        cout << "SERVER:: get_command()" << endl;
    return data->get_command(message);
}

string 
ServerFacade::reset_command(Message message)
{
    if(debug)
        cout << "SERVER:: reset_command()" << endl;
    // create new database
    return data->reset_command();

}