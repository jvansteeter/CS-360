import errno
import select
import socket
import sys
import traceback
import argparse
import os
from time import gmtime, strftime
from datetime import datetime
try:
    from http_parser.parser import HttpParser
except ImportError:
    from http_parser.pyparser import HttpParser

configHost = {}
configMedia = {}
configParameter = {}

def parse_config():
    """Function to parse the config file"""
    Debug.dprint("SERVER::parse_config()")
    fileReader = open("web.config", 'r')
    #print fileReader.read()
    for line in fileReader.read().split('\n'):
        items = line.split(' ')
        if items[0] == "host":
            configHost[items[1]] = items[2]
        elif items[0] == "media":
            configMedia[items[1]] = items[2]
        elif items[0] == "parameter":
            configParameter[items[1]] = items[2]
    """print "finished parsing"
    for key in configHost:
        print key, " : ", configHost[key]
    for key in configMedia:
        print key, " : ", configMedia[key]
    for key in configParameter:
        print key, " : ", configParameter[key]"""

class Debug:
    """Debug Class"""
    debugState = False

    @staticmethod
    def setState(newState):
        Debug.debugState = newState

    @staticmethod
    def dprint(debugString):
        if(Debug.debugState == True):
            print '\t' + str(debugString)

class Poller:
    """ Polling server """
    def __init__(self,port):
        self.host = ""
        self.port = port
        self.open_socket()
        self.clients = {}
        self.mark = {}
        self.size = 1024

    def open_socket(self):
        """ Setup the socket for incoming clients """
        Debug.dprint("POLLER::open_socket()")
        try:
            self.server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR,1)
            self.server.bind((self.host,self.port))
            self.server.listen(5)
            self.server.setblocking(0)
        except socket.error, (value,message):
            if self.server:
                self.server.close()
            print "Could not open socket: " + message
            sys.exit(1)

    def run(self):
        """ Use poll() to handle each incoming client."""
        Debug.dprint("POLLER::run()")
        self.poller = select.epoll()
        self.pollmask = select.EPOLLIN | select.EPOLLHUP | select.EPOLLERR
        self.poller.register(self.server,self.pollmask)
        while True:

            # poll sockets
            try:
                #startTime = datetime.now()
                '''for key in self.clients:
                    cc = self.clients[client]
                    print "$#!@#$!#@ " + str(cc)
                    lastEvent = self.mark[cc]#FUCK THIS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    current = datetime.now()
                    totalTime = current - lastEvent
                    if (totalTime.seconds >= configParameter['timeout']):
                        #self.poller.unregister(fd)
                        client.close()
                        del self.clients[client.fileno()]
                for key in self.mark:
                    print "!!!!!key= " + str(key) + " mark= " + str(self.mark[key])'''

                fds = self.poller.poll(timeout=0.5)
                


                #endTime = datetime.now()
                #totalTime = endTime - startTime
                
                #print "!!!" + str(len(fds))
                #print "!!!!!!start: " + str(startTime) + " end: " + str(endTime) + " total: " + str(totalTime.seconds)
            except:
                return
            for (fd,event) in fds:
                # handle errors
                if event & (select.POLLHUP | select.POLLERR):
                    self.handleError(fd)
                    continue
                # handle the server socket
                if fd == self.server.fileno():
                    self.handleServer()
                    continue
                # handle client socket
                result = self.handleClient(fd)
                #print "fd= " + str(fd) + " event= " +str(event)

    def handleError(self,fd):
        Debug.dprint("POLLER::handleError")
        self.poller.unregister(fd)
        if fd == self.server.fileno():
            # recreate server socket
            self.server.close()
            self.open_socket()
            self.poller.register(self.server,self.pollmask)
        else:
            # close the socket
            self.clients[fd].close()
            del self.clients[fd]

    def handleServer(self):
        # accept as many clients as possible
        Debug.dprint("POLLER::handleServer()")
        while True:
            Debug.dprint("POLLER::handleServerLoop")
            try:
                (client,address) = self.server.accept()
            except socket.error, (value,message):
                Debug.dprint("POLLER::handleServerLoop except")
                # if socket blocks because no clients are available,
                # then return
                if value == errno.EAGAIN or errno.EWOULDBLOCK:
                    Debug.dprint("POLLER::handleServerLoop if EAGAIN or EWOULDBLOCK0")
                    Debug.dprint("POLLER::value= " + str(value) + " message= " + str(message))
                    return
                print traceback.format_exc()
                sys.exit()
            # set client socket to be non blocking
            client.setblocking(0)
            self.clients[client.fileno()] = client
            self.poller.register(client.fileno(),self.pollmask)

    def handleClient(self,fd):
        Debug.dprint("POLLER::handleClient()")
        try:
            data = self.clients[fd].recv(self.size)
            self.mark[fd] = datetime.now()
            Debug.dprint("POLLER::data->" + str(data))
        except socket.error, (value,message):
            # if no data is available, move on to another client
            if value == errno.EAGAIN or errno.EWOULDBLOCK:
                return
            print traceback.format_exc()
            sys.exit()

        if data:
            response = self.handleRequest(data)
            self.clients[fd].sendall(response)     #this is the line of code that is breaking my whole system.  The send() function is not sending all the data the socket.
            self.clients[fd].close()
            '''self.clients[fd].send(response)
            self.clients[fd].send(response)
            print "!!!count " + str(count)
            self.poller.unregister(fd)
            self.clients[fd].close()'''
        else:
            self.poller.unregister(fd)
            self.clients[fd].close()
            del self.clients[fd]

    def handleRequest(self,data):
        """Prcess the request made by the client and send the response"""
        Debug.dprint("POLLER::handleRequest()")
        self.headers = {}
        self.headers['Server'] = "SimpleHTTP/0.6 Python/2.7.9"
        self.headers['Date'] = strftime("%a, %d %b %Y %H:%M:%S GMT", gmtime())
        #self.headers['Connection'] = "close"
        p = HttpParser()
        nparsed = p.execute(data,len(data))
        method = p.get_method()
        path = p.get_path()
        headers = p.get_headers()
        Debug.dprint("POLLER::handleClient()::get_method= " + str(p.get_method()))
        Debug.dprint("POLLER::handleClient()::get_path= " + str(p.get_path()))
        Debug.dprint("POLLER::handleClient()::get_headers= " + str(p.get_headers()))

        """Check the Method, if not GET return 501"""
        if method != 'GET':
            return self.response501()

        """Determine Host"""
        Debug.dprint("POLLER::Host= " + headers['Host'])
        RootDir = ""
        if headers['Host'].find("localhost") != -1:
            RootDir = configHost['localhost']
        else:
            RootDir = configHost['default']

        """Find requested Resource"""
        if path == "/":
            path = "/index.html"
        try:
            if path.find('.') != -1:
                pathObjects = path.split('.')
                dataType = str(pathObjects[len(pathObjects) - 1])

            if configMedia.has_key(dataType):
                self.headers['Content-Type'] = configMedia[dataType]
            else:
                self.headers['Content-Type'] = "text/plain"

            fileName = RootDir + path
            fileReader = open(fileName, 'rb')
            body = fileReader.read()
            print "!!! body length " + str(len(body)) 
            self.headers['Content-Length'] = os.stat(fileName).st_size
            self.headers['Last-Modified'] = strftime("%a, %d %b %Y %H:%M:%S GMT", gmtime(os.stat(fileName).st_mtime))
            response = "HTTP/1.1 200 OK\r\n"
            for key in self.headers:
                response += str(key) + ": " + str(self.headers[key]) + "\r\n"
                Debug.dprint("POLLER::responseHeader: " + str(key) + ": " + str(self.headers[key]))
            """response += "Date: " + str(self.headers['Date']) + "\r\n"
            response += "Server: " + str(self.headers['Server']) + "\r\n"
            response += "Content-Type: " + str(self.headers['Content-Type']) + "\r\n"
            response += "Content-Length: " + str(self.headers['Content-Length']) + "\r\n"
            response += "Last-Modified: " + str(self.headers['Last-Modified']) + "\r\n"""
            response += "\r\n"
            response += str(body)
            return response
        except IOError:
            return self.response404()


    def response400(self):
        """send a 400 Bad Request response"""
        Debug.dprint("POLLER::response400()")
        body = "<h1>400 Bad Request</h1>"
        self.headers['Content-Length'] = len(body)
        self.headers['Content-type'] = "text/html"
        response = "HTTP/1.1 400 Bad Request\r\n"
        for key in self.headers:
            response += str(key) + ": " + str(self.headers[key]) + "\r\n"
        response += "\r\n" + body
        return response

    def response403(self):
        """send a 403 Forbidden response"""
        Debug.dprint("POLLER::response403()")
        body = "<h1>403 Forbidden</h1>"
        self.headers['Content-Length'] = len(body)
        self.headers['Content-type'] = "text/html"
        response = "HTTP/1.1 403 Forbidden\r\n"
        for key in self.headers:
            response += str(key) + ": " + str(self.headers[key]) + "\r\n"
        response += "\r\n" + body
        return response

    def response404(self):
        """send a 404 Not Found response"""
        Debug.dprint("POLLER::response404()")
        body = "<h1>404 Not Found</h1>"
        self.headers['Content-Length'] = len(body)
        self.headers['Content-type'] = "text/html"
        response = "HTTP/1.1 404 Not Found\r\n"
        for key in self.headers:
            response += str(key) + ": " + str(self.headers[key]) + "\r\n"
        response += "\r\n" + body
        return response

    def response500(self):
        """send a 500 Internal Server Error response"""
        Debug.dprint("POLLER::response500()")
        body = "<h1>500 Internal Server Error</h1>"
        self.headers['Content-Length'] = len(body)
        self.headers['Content-type'] = "text/html"
        response = "HTTP/1.1 500 Internal Server Error\r\n"
        for key in self.headers:
            response += str(key) + ": " + str(self.headers[key]) + "\r\n"
        response += "\r\n" + body
        return response

    def response501(self):
        """send a 501 Not Implemented response"""
        Debug.dprint("POLLER::response501()")
        body = "<h1>501 Not Implemented</h1>"
        self.headers['Content-Length'] = len(body)
        self.headers['Content-type'] = "text/html"
        response = "HTTP/1.1 501 Not Implemented\r\n"
        for key in self.headers:
            response += str(key) + ": " + str(self.headers[key]) + "\r\n"
        response += "\r\n" + body
        return response

class Main:
    """ Parse command line options and perform the download. """
    def __init__(self):
        self.parse_arguments()
        
    def parse_arguments(self):
        ''' parse arguments, which include '-p' for port '''
        parser = argparse.ArgumentParser(prog='Echo Server', description='A simple echo server that handles one client at a time', add_help=True)
        parser.add_argument('-p', '--port', type=int, action='store', help='port the server will bind to',default=8080)
        parser.add_argument('-d', '--debug', action='store_true', help='server will display debug comments')
        self.args = parser.parse_args()

    def run(self):
        Debug.dprint("SERVER::initializing poller")
        p = Poller(self.args.port)
        Debug.setState(self.args.debug)
        p.run()

if __name__ == "__main__":
    m = Main()
    m.parse_arguments()
    parse_config()
    try:
        m.run()
    except KeyboardInterrupt:
        pass