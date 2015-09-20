#include "Message.h"

Message::Message()
{


}

Message::~Message()
{

}

string Message::toString()
{
	stringstream output;
	output << "Message::command=" << command << endl
		<< "message::params[0]=" << params[0] << endl
		<< "message::params[1]=" << params[1] << endl
		<< "message::value=" << value << endl
		<< "message::needed=" << needed << endl
		<< "message::cache=" << cache << endl;
	return output.str();
}

/*
string Message::getCommand()
{
	return command;
}

string* Message::getParams()
{
	return params;
}

string Message::getValue()
{
	return value;
}

bool Message::getNeeded()
{
	return needed;
}

void Message::setCommand(string c)
{
	command = c;
}

void Message::setParams(string* p)
{
	params = p;
}

void Message::setValue(string v)
{
	value = v;
}

void Message::setNeeded(bool n)
{
	needed = n;
}
*/