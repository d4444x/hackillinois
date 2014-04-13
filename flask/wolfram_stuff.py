#from datetime import date
from datetime import datetime
from firebase import firebase
import time
import random
import urllib
import urllib2
import xml.etree.ElementTree as ET
import APIconstants
random.seed(1337)

fb = firebase.FirebaseApplication('https://rhtuts.firebaseio.com/')

wolfram_API_id = APIconstants.WOLFRAM_API_ID



def create_graph_from_dates(dates):
        if len(dates) < 3:
                return ""
        
        date_format = "%m/%d/%Y %H:%M:%S"
        
        start_date = datetime.strptime(dates[0][0], date_format)

        data_points = []
        day_fudger = 0
        for num_solved, d in enumerate(dates):
                d = datetime.strptime(d[0], date_format)
            
                #fudge it lol
                days_delta = (d - start_date).days + day_fudger
                day_fudger = day_fudger + random.randint(0, 4)
                
                data_points.append((days_delta, num_solved))

        filtered_data = []
        for i in range(len(data_points)):
                data1 = data_points[i]
                if i + 1 == len(data_points):
                        filtered_data.append(data1)
                        break
                data2 = data_points[i + 1]
                if(data1[0] != data2[0]):
                        filtered_data.append(data1)
        index = 0
        solved = 0

        filtered2_data = []
        for day, num_solved in filtered_data:
                for i in range(index, day):
                        filtered2_data.append((i, solved))
                filtered2_data.append((day, num_solved))
                index = day + 1
                solved = num_solved
                
                
        #print filtered_data
        #print filtered2_data
        ##str(map(lambda x: x[1], filtered_data))
        graph_querey_url = "http://api.wolframalpha.com/v2/query?appid=" + wolfram_API_id + "&input=LinePlot" + urllib.quote(str(map(lambda x: x[1], filtered2_data)).replace(' ','')) + "&format=image"
        ##print graph_querey_url
        response = urllib2.urlopen(graph_querey_url)
        graph_xml = response.read()
        root = ET.fromstring(graph_xml)

        return root.findall(".*//img")[1].get("src")


def WAPquery(text):
    text = text.replace("True", "")
    return urllib2.urlopen("http://api.wolframalpha.com/v2/query?appid="+APIconstants.WOLFRAM_AUTH+"&input="+urllib2.quote(text)+"&format=plaintext").read()
def checkEquality(a,b):
    wap = WAPquery(a+"="+b)
    if(wap.find("True")!=-1):
        return True
    return False
