import argparse
import os
import requests
import sys
import threading
import time

class Shared:
    """ Shared memory """
    def __init__(self,url):
        self.index = 0
        self.data = {}
        self.sem = threading.Semaphore()
        self.url = url
        header = {'Accept-Encoding':'identity'}
        self.head = requests.head(url, headers=header)
        """if the url does not allow byte ranges raise and exception"""
        if (self.head.headers['Accept-Ranges'] != 'bytes'):
        	raise Exception("Web resourse does not accept byte ranges")
        self.byteSize = int(self.head.headers['Content-Length'])

    def getIndex(self):
        """ increment the shared varable """
        self.sem.acquire()
        s = self.index
        self.index = self.index + 1
        self.sem.release()
        return s

class DownThread(threading.Thread):
    """ A thread that grabs a section of the resourses and downloads it"""
    def __init__(self,shared, chunkSize):
        threading.Thread.__init__(self)
        self.shared = shared
        self.chunkSize = chunkSize
        self.index = self.shared.getIndex()
        self.url = shared.url
        self.data = "";

    def run(self):
    	byteRange = "bytes=" + str(self.index * self.chunkSize) + "-" + str((self.index * self.chunkSize) + self.chunkSize - 1)
    	header = {'Range': byteRange, 'Accept-Encoding':'identity'}
    	chunk = requests.get(self.url, headers=header)
    	self.data = chunk.content
    	self.shared.data[self.index] = self.data

class DownloadAccelerator:
    """Main class"""
    def __init__(self,number):
    	self.threadNumber = number

    def download(self, url):
    	self.startTime = time.time()
    	self.shared = Shared(url)
       
        """Define how much each thread should get"""
        self.chunkSize = (self.shared.byteSize / self.threadNumber) + 1

        """create the file to download content to"""
        dir = url.split('/')
        fileName = dir[len(dir) - 1]
        if (fileName == ""):
        	fileName = "index.html"
        fileWriter = open(fileName, 'wb')

        """run and join threads"""
        threads = []
        for i in range(0, self.threadNumber):
        	thread = DownThread(self.shared, self.chunkSize)
        	threads.append(thread)
        	thread.start()
        for thread in threads:
        	thread.join()

        """write all the gathered data to the file"""
        for i in range(0, self.threadNumber):
        	fileWriter.write(self.shared.data[i])
        fileWriter.close()
        print url + " " + str(self.threadNumber) + " " + str(self.shared.byteSize) + " " + str(time.time() - self.startTime)
        
def parse_options():
        parser = argparse.ArgumentParser(prog='DownloadAccelerator', description='Download web resourses using multithreading', add_help=True)
        parser.add_argument('-n', '--number', type=int, action='store', help='Specify the number of threads to create',default=10)
        parser.add_argument('url', nargs=1, action='store', help='name of the url to download')
        return parser.parse_args()

if __name__ == "__main__":
    args = parse_options()
    d = DownloadAccelerator(args.number)
    d.download(args.url[0])