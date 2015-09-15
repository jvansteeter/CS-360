#pragma once
#include <string>

using namespace std;

class Message 
{
public:
    Message();
    ~Message();

    string getCommand();
    string getParams();
    string getValue();
    bool getNeeded();
    void setCommand(string command);
    void setParams(string params[]);
    void setValue(string value);
    void setNeeded(bool needed);

private:
    string command;
    string params[];
    string value;
    bool needed;
};