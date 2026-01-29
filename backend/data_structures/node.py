class Node:
    #Group 1 work on developing class
    
    #Public
    def __init__(self, latitude, longitude, airport):
        self.latitude = latitude #latitude coordinate
        self.longitude = longitude #longitude coordinate
        self.airport = airport #boolean that indicates whether node is an airport or not

    def setLatitude(self, latitude):
        self.latitude = latitude
        
    def setLongitude(self, longitude):
        self.longitude = longitude

    def isAirport(self):
        return self.airport
    
    def getLatitude(self):
        return self.latitude
        
    def getLongitude(self):
        return self.longitude