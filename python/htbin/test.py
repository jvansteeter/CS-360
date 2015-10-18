#!/usr/bin/env python

import requests

print "Content-type: text/html"
print
print "<h1>Test</h1>"

request = requests.head("http://cs360.byu.edu/fall-2015/homework/python-threading")
print "stuff"