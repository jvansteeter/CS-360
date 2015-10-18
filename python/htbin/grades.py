#!/usr/bin/env python

print "Content-type: text/html"
print
print "<h1>Grades</h1>"
with open("grades.txt", "r") as grades:
	while(True):
		line = grades.readline()
		if(line[0] == "#"):
			print "<h2>" + line[1:len(line)] + "</h2>"
		elif(line == ""):
			break
		else:
			print line + "<br>"