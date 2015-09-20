#pragma once

#include <errno.h>
#include <netinet/in.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <unistd.h>

#include <string>
#include <sstream>
#include <iostream>
#include "Message.h"

#include <map>
#include <vector>

using namespace std;

class Server {
public:
    Server(int port, bool debug);
    ~Server();

    void run();
    
private:
    void create();
    void close_socket();
    void serve();
    void handle(int);
    string get_request(int);
    bool send_response(int, string);

    Message parse_request(string request);
    void get_value(int client, Message message);
    string put_command(Message message);
    
    int port_;
    int server_;
    int buflen_;
    char* buf_;
    bool debug;

    map<string,vector<map<string, string> > > data;
};
