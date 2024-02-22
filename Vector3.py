from math import sqrt, sin, cos, atan2

class Vector3:

    def __init__(self, x, y=None, w=None):
        self.x = x
        self.y = y if y is not None else x
        self.w = w if w is not None else 0

    def normalize(self):
        m = self.length()
        if m == 0:
            return self
        return self/m

    def dot(self, v):
        return self.x * v.x + self.y * v.y + self.w * v.w

    def dot2(self):
        return self.dot(self)

    def cross(self, v):
        return Vector3(self.y * v.w - self.w * v.y, self.w * v.x - self.x * v.w, self.x * v.y - self.y * v.x)
    
    def length(self):
        return sqrt(self.x**2 + self.y**2 + self.w**2)
    
    def angle(self):
        return atan2(self.y, self.x)
    
    def translate(self, v):
        return self + v
    
    def scale(self, s):
        return self * s
    
    def rotate(self, theta):
        return Vector3(self.x * cos(theta) - self.y * sin(theta), self.x * sin(theta) + self.y * cos(theta), self.w)

    # Overriding for comparisons to other Vector3
    def __eq__(self, v): 
        return self.x == v.x and self.y == v.y and self.w == v.w
    
    def __add__(self, b):
        return Vector3(self.x + b.x, self.y + b.y, self.w + b.w)
        
    def __sub__(self, b):
        return Vector3(self.x - b.x, self.y - b.y, self.w - b.w)

    def __neg__(self):
        return Vector3(-self.x, -self.y, -self.w)
    
    def __truediv__(self, b):
        return Vector3(self.x / b, self.y / b, self.w / b)
    
    def __mul__(self, b):
        return Vector3(self.x * b, self.y * b, self.w * b)
    
    def __str__(self):
        return "({},{},{})".format(self.x, self.y, self.w)