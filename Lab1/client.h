#pragma once

#include <errno.h>
#include <netdb.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <unistd.h>

#include <fstream>
#include <iostream>
#include <string>
#include <sstream>

using namespace std;

class Client {
public:
    Client(string host, int port, bool debug);
    ~Client();

    void run();

private:
    virtual void create();
    virtual void close_socket();
    void protocol();
    bool send_request(string);
    bool get_response();
    string parse_command(string command);
    void sendCommand(string user, string subject);
    void listCommand(string user);
    void readCommand(string user, int index);

    string host_;
    int port_;
    int server_;
    int buflen_;
    char* buf_;
    bool debug;
};
