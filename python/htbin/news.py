#!/usr/bin/env python

import requests

print "Content-type: text/html"
print
print "<h1>News</h1>"

request = requests.get("http://news.google.com")
print request.content


"""
header = ('Range':'bytes=0-100', 'Accept-Encoding':'identity')
url = "http://cs360.byu.edu/fall-2015"
chunk = requests.get(url, headers=header)
print chunk.text"""