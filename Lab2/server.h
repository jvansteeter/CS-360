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
#include "ServerFacade.h"

#include <map>
#include <vector>
#include <utility>
#include <queue>

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

    int port_;
    int server_;
    bool debug;
    Database data;
    queue<int> client_que;
    sem_t que_lock;
    sem_t que_notEmpty;
};
