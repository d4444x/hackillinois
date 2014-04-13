from firebase import firebase
import wolfram_stuff
import re
import random

fb = firebase.FirebaseApplication('https://rhtuts.firebaseio.com/')

def getGraph(user):
    #Takes the user screwed up string thing
    random.seed(1337)
    #takes the user returns the url to the graph
    k = fb.get('users/'+user,None)
    times = k['times'].split('; ')
    answered = k['answered'].split(' ')
    #aaron code go here
    ans = zip(times,answered)
    sections = {}
    for s in ans:
        print s
        r = re.match(".+?sections/(.+?)/",s[1])
        sec = r.groups()[0]
        if(sec not in sections):
            sections[sec] = [s,]
        else:
            sections[sec].append(s)
    end = {}
    for k in sections:
        print sections[k]
        end[k] = wolfram_stuff.create_graph_from_dates(sections[k])
    return end
