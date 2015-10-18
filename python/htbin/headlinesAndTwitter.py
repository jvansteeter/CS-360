#!/usr/bin/env python

import requests
from bs4 import BeautifulSoup
import threading

print "Content-type: text/html"
print
print "<h1>Headlines and Twitter</h1>"

class headlineThread(threading.Thread):
	def __init__(self,content):
		self.content = content
		threading.Thread.__init__(self)

	def run(self):
		request = requests.get("http://news.google.com")
		soup = BeautifulSoup(request.content, 'html.parser')
		results = soup.find_all("span", {"class":"titletext"})
		for i in results:
			self.content.append(str(i) + "<br>")
	
class twitterThread(threading.Thread):
	def __init__(self,content):
		self.content = content
		threading.Thread.__init__(self)

	def run(self):
		request = requests.get("https://twitter.com/whatstrending")
		soup = BeautifulSoup(request.content, 'html.parser')
		results = soup.find_all("p", {"class":"tweet-text"})
		for i in results:
			self.content.append(str(i) + "<br>")

content1 = []
content2 = []

lines = headlineThread(content1)
tweets = twitterThread(content2)
lines.start()
tweets.start()
lines.join()
tweets.join()

print "<div style=\"float: left; width:45%\">"
for cont in content1:
	print cont 
print "</div>"

print "<div style=\"float: right; width:45%\">"
for cont in content2:
	print cont 
print "</div>"