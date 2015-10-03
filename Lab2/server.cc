#include "server.h"

Server::Server(int port, bool d) {
    // setup variables
    port_ = port;
    debug = d;
    sem_init(&que_lock,0,1);
    sem_init(&que_notEmpty,0,0);
}

Server::~Server() {
}

struct handle_
{
    queue<int>* client_que;
    Database* data;
    sem_t* que_lock;
    sem_t* que_notEmpty;
    bool debug;
};

// thread function
void *
handle_que(void *ptr)
{
    // disassemble struct package
    struct handle_* package;
    package = (struct handle_*) ptr;
    queue<int>* client_que = package->client_que;
    Database* data = package->data;
    sem_t* que_lock = package->que_lock;
    sem_t* que_notEmpty = package->que_notEmpty;
    bool debug = package->debug;

    ServerFacade facade = ServerFacade(data, debug);
    
    while(1)
    {
        sem_wait(que_notEmpty);
        sem_wait(que_lock);
        int client = client_que->front();
        client_que->pop();
        sem_post(que_lock);
        bool success = facade.handle(client);
        if(success)
        {
            sem_wait(que_lock);
            client_que->push(client);
            sem_post(que_lock);
            sem_post(que_notEmpty);
        }
    }
}

void
Server::run() {
    // create and run the server
    create();

    // create and run 10 threads
    for(unsigned int i = 0; i < 10; i++)
    {
        struct handle_ package;
        package.client_que = &client_que;
        package.data = &data;
        package.que_lock = &que_lock;
        package.que_notEmpty = &que_notEmpty;
        package.debug = debug;

        pthread_t thread;
        pthread_create(&thread, NULL, &handle_que, &package);
    }
    serve();
}

void
Server::create() {
    if (debug)
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
Server::close_socket() 
{
    if(debug)
        cout << "SERVER:: close_socket()" << endl;
    close(server_);
}

void
Server::serve() 
{
    // setup client
    int client;
    struct sockaddr_in client_addr;
    socklen_t clientlen = sizeof(client_addr);

      // accept clients, add to que, and post to semaphore
    while ((client = accept(server_,(struct sockaddr *)&client_addr,&clientlen)) > 0) 
    {
        if(debug)
            cout << "SERVER:: serve()" << endl;
        sem_wait(&que_lock);
        client_que.push(client);
        sem_post(&que_lock);
        sem_post(&que_notEmpty);
    }
    close_socket();
}
