#pragma once
#include <string>
#include <sstream>

using namespace std;

class Message 
{
public:
    Message();
    ~Message();

    string command;
    string params[2];
    int value;
    bool needed;
    string cache;

    string toString();
/*
    string getCommand();
    string getParams();
    string getValue();
    bool getNeeded();
    void setCommand(string command);
    void setParams(string* params);
    void setValue(string value);
    void setNeeded(bool needed);
*/

   
};