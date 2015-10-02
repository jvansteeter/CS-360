#pragma once

#include "Message.h"
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <time.h>
#include <iostream>

#include <semaphore.h>
#include <map>
#include <vector>
#include <utility>

using namespace std;

class Database
{
public:
	Database();
	~Database();

	string put_command(Message message);
	string list_command(Message message);
	string get_command(Message message);
	string reset_command();

private:
	sem_t lock;
	map<string,vector<pair<string, string> > > data;
};