class Node:
    #Group 1 work on developing class
    
    #Public
    def __init__(self, latitude, longitude, airport, isOpen):
        self.latitude = latitude #latitude coordinate
        self.longitude = longitude #longitude coordinate
        self.airport = airport #boolean that indicates whether node is an airport or not
        self.isOpen = isOpen #boolean that indicates whether node is available to fly or not
        self.radius = 5 #5 mile radius around the center point

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
    
    def __hash__(self):
        return hash((self.latitude, self.longitude))

    def __eq__(self, other):
        return (self.latitude, self.longitude) == (other.latitude, other.longitude)