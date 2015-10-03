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
#include "database.h"

#include <map>
#include <vector>
#include <utility>

using namespace std;

class ServerFacade
{
public:
	ServerFacade(Database* data, bool debug);
	~ServerFacade();

	bool handle(int client);


private:
    string get_request(int);
    bool send_response(int, string);
    Message parse_request(string request);
    void get_value(int client, Message & message);
    string put_command(Message message);
    string list_command(Message message);
    string get_command(Message message);
    string reset_command(Message message);

	//int client;
	Database* data;
	bool debug;
};