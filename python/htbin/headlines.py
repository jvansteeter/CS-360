#!/usr/bin/env python

import requests
from bs4 import BeautifulSoup

print "Content-type: text/html"
print
print "<h1>Headlines</h1>"

request = requests.get("http://news.google.com")
soup = BeautifulSoup(request.content, 'html.parser')
results = soup.find_all("span", {"class":"titletext"})

for i in results:
	print str(i) + "<br>"
