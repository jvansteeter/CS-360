#include "ConnQueue.h"

ConnQueue::ConnQueue(int queSize, Server *server)
{
	this.queSize = queSize;
	this.server = server;
}

ConnQueue::~ConnQueue()
{

}

void ConnQueue::addClient(int client)
{

}