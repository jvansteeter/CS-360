#include "database.h"

Database::Database()
{
	// initialize Semaphor
	sem_init(&lock, 0, 1);
}

Database::~Database()
{

}

string Database::put_command(Message message)
{
	string name = message.params[0];
    string subject = message.params[1];
    string email = message.cache;

    map<string,vector<pair<string, string> > >::iterator it;

    // lock mutex
    sem_wait(&lock);
    it = data.find(name);
    if (it == data.end())
    {
        pair<string,string> user_message(subject,email);
        vector<pair<string, string> > user_messages;
        user_messages.push_back(user_message);
        pair<string, vector<pair<string, string> > > user_account(name, user_messages);
        data.insert(user_account);
    }
    else
    {
        it->second.push_back(pair<string,string>(subject,email));
    }
    // unlock mutex
    sem_post(&lock);
    return "OK\n";
}

string Database::list_command(Message message)
{
	string name = message.params[0];
    map<string,vector<pair<string, string> > >::iterator it;
    
    // lock mutex
    sem_wait(&lock);
    it = data.find(name);
    string response;
    if(it == data.end())
    {
        response = "list 0\n";
    }
    else
    {
        stringstream ss;
        ss << "list " << it->second.size() << "\n";
        for (unsigned int i = 0; i < it->second.size(); i++)
        {
            ss << (i + 1) << " " << it->second[i].first << "\n";
        }
        response = ss.str();
    }
    // unlock mutex
    sem_post(&lock);
    return response;
}

string Database::get_command(Message message)
{
	string name = message.params[0];
    string index_string = message.params[1];
    int index = atoi(index_string.c_str()) - 1;
    map<string,vector<pair<string, string> > >::iterator it;
    
    // lock mutex
    sem_wait(&lock);
    it = data.find(name);
    string response;
    if(it == data.end())
    {
        response = "error there is no message for that use at that index\n";
    }
    else
    {
        //test for the index out of bounds
        if(index + 1 > it->second.size())
            return "error out of bounds index\n";
        stringstream ss;
        string subject = it->second[index].first;
        string email = it->second[index].second;
        int length = email.size();
        ss << "message " << subject << " " << length << "\n"
            << email;

        response = ss.str();
    }
    // unlock mutex
    sem_post(&lock);
    return response;
}

string Database::reset_command()
{
	// lock mutex
	sem_wait(&lock);
	data.clear();
	// unlock mutex
	sem_post(&lock);
	return "OK\n";
}