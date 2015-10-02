#pragma once

#include "server.h"

using namespace std;

class ConnQueue
{
public:
	ConnQueue(int queSize, *Server server);
	~Connqueue();

	void addClient(int client);

private:
	int queSize;
	Server *server;
}