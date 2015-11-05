import errno
import select
import socket
import sys
import traceback
import argparse

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
        self.size = 1024

    def open_socket(self):
        """ Setup the socket for incoming clients """
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
        self.poller = select.epoll()
        self.pollmask = select.EPOLLIN | select.EPOLLHUP | select.EPOLLERR
        self.poller.register(self.server,self.pollmask)
        while True:
            # poll sockets
            try:
                fds = self.poller.poll(timeout=1)
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

    def handleError(self,fd):
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
        while True:
            try:
                (client,address) = self.server.accept()
            except socket.error, (value,message):
                # if socket blocks because no clients are available,
                # then return
                if value == errno.EAGAIN or errno.EWOULDBLOCK:
                    return
                print traceback.format_exc()
                sys.exit()
            # set client socket to be non blocking
            client.setblocking(0)
            self.clients[client.fileno()] = client
            self.poller.register(client.fileno(),self.pollmask)

    def handleClient(self,fd):
        try:
            data = self.clients[fd].recv(self.size)
        except socket.error, (value,message):
            # if no data is available, move on to another client
            if value == errno.EAGAIN or errno.EWOULDBLOCK:
                return
            print traceback.format_exc()
            sys.exit()

        if data:
            fileReader = open("html/default/pic.jpg", 'rb')
            body = fileReader.read()
            self.clients[fd].send(body)
            self.poller.unregister(fd)
            self.clients[fd].close()
            del self.clients[fd]
        else:
            self.poller.unregister(fd)
            self.clients[fd].close()
            del self.clients[fd]

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
    #parse_config()
    try:
        m.run()
    except KeyboardInterrupt:
        pass