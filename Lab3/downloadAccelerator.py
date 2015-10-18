import argparse
import os
import requests
import sys
import threading

class Shared:
    """ Shared memory """
    def __init__(self,url):
        self.index = 0
        self.data = {}
        self.sem = threading.Semaphore()
        self.lock = threading.Lock()
        self.url = url
        header = {'Accept-Encoding':'identity'}
        self.head = requests.head(url, headers=header)
        if (self.head.headers['Accept-Ranges'] != 'bytes'):
        	raise Exception("Web resourse does not accept byte ranges")
        print "!!!HEADER INFORMATION!!!" 
        print self.head.headers
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
    	print "byteRange= " + byteRange
    	header = {'Range': byteRange, 'Accept-Encoding':'identity'}
    	chunk = requests.get(self.url, headers=header)
    	self.data = chunk.content
    	self.shared.data[self.index] = self.data

class DownloadAccelerator:
    """Main class"""
    def __init__(self,number):
    	self.threadNumber = number

    def download(self, url):
    	self.shared = Shared(url)
        print "Number of threads: " + str(self.threadNumber) + "\n"
        print "Url to download: " + url + '\n'
        print "Total bytes to download: " + str(self.shared.byteSize) + '\n'

        """Define how much each thread should get"""
        self.chunkSize = (self.shared.byteSize / self.threadNumber) + 1

        """run and join threads"""
        threads = []
        for i in range(0, self.threadNumber):
        	thread = DownThread(self.shared, self.chunkSize)
        	threads.append(thread)
        	thread.start()

        for thread in threads:
        	thread.join()

        """create the file to download content to"""
        dir = url.split('/')
        print url.split('/')
        print dir[len(dir) - 1]
        fileName = dir[len(dir) - 1]
        if (fileName == ""):
        	fileName = "index.html"
        elif (fileName.find(".") == -1):
        	fileName += ".html"
        print fileName


        for i in range(0, self.threadNumber):
        	print "---Thread assigned index " + str(i) + " has retrieved " + str(len(self.shared.data[i])) +'---\n'
        	print self.shared.data[i]

        print "!!!All done!!!" + str(len(threads))
        
def parse_options():
        parser = argparse.ArgumentParser(prog='DownloadAccelerator', description='Download web resourses using multithreading', add_help=True)
        parser.add_argument('-n', '--number', type=int, action='store', help='Specify the number of threads to create',default=10)
        parser.add_argument('url', nargs=1, action='store', help='name of the url to download')
        return parser.parse_args()

if __name__ == "__main__":
    args = parse_options()
    d = DownloadAccelerator(args.number)
    d.download(args.url[0])



    """for i in range(0,args.number):
        h = Hello(s)
        h.start()"""





"""
header = ('Range':'bytes=0-100', 'Accept-Encoding':'identity')
url = "http://cs360.byu.edu/fall-2015"
chunk = requests.get(url, headers=header)
print chunk.text"""

"""
header = request.head(url)
header['Content-Length']
"""


"""
header = {'Range':'bytes=0-100', 'Accept-Encoding':'identity'}
url = 'http://cs360.byu.edu/fall-2015/'
print "assigned index=" + str(self.index)
head = requests.head(url)
print head.status_code
print head.headers
print head.text
chunk = requests.get(url, headers=header)
print chunk.status_code
print chunk.headers
#print chunk.text"""