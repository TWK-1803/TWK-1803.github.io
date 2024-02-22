from Vector3 import Vector3
from Shapes import *
import pygame
from itertools import combinations
from random import randint
import asyncio

def tripleProd(v1, v2, v3):
    return (v1.cross(v2)).cross(v3)

def lineCase(simplex):
    global direction

    B, A = simplex
    AB, AO = B-A, origin - A
    if AB.normalize() == AO.normalize():
        return True
    ABperp = tripleProd(AB, AO, AB)
    direction = ABperp
    return False

def triangleCase(simplex):
    global direction

    C, B, A = simplex
    AB, AC, AO = B-A, C-A, origin - A
    if lineCase([A,B]) or lineCase([A,C]): # Line Cases
        return True
    ABperp = tripleProd(AC, AB, AB)
    ACperp = tripleProd(AB, AC, AC)
    if ABperp.dot(AO) > 0: #Region AB
        simplex.remove(C)
        direction = ABperp
        return False
    elif ACperp.dot(AO) > 0: #Region AC
        simplex.remove(B)
        direction = ACperp
        return False
    return True

def handleSimplex(simplex):
    if len(simplex) == 2:
        return lineCase(simplex)
    return triangleCase(simplex)

def support(s1, s2):
    return s1.furthestPoint(direction) - s2.furthestPoint(-direction)

def GJK(s1, s2):
    global direction

    direction = (s2.pos-s1.pos).normalize()
    simplex = [support(s1, s2)]
    direction = origin - simplex[0]
    while True:
        A = support(s1, s2)
        product = A.dot(direction)
        if product < 0:
            return False
        simplex.append(A)
        if handleSimplex(simplex):
            s1.colliding = True
            s2.colliding = True
            return True

width, height = 800, 600
size = (width, height)
black = (20, 20, 20)
white = (247, 247, 247)
green = (20, 247, 20)

#pygame configurations
pygame.init()
pygame.display.set_caption("GJK Algorithm")
screen = pygame.display.set_mode(size)
clock = pygame.time.Clock()
fps = 60
screenOffset = 100

origin  = Vector3(0, 0)
direction = Vector3(origin)

objects = [Circle(randint(0 + screenOffset, width - screenOffset), randint(0 + screenOffset, height - screenOffset), randint(25, screenOffset)),
           Triangle(randint(0 + screenOffset, width - screenOffset), randint(0 + screenOffset, height - screenOffset), randint(25, screenOffset)),
           Square(randint(0 + screenOffset, width - screenOffset), randint(0 + screenOffset, height - screenOffset), randint(25, screenOffset)),
           Pentagon(randint(0 + screenOffset, width - screenOffset), randint(0 + screenOffset, height - screenOffset), randint(25, screenOffset)),
           Hexagon(randint(0 + screenOffset, width - screenOffset), randint(0 + screenOffset, height - screenOffset), randint(25, screenOffset)),
           Heptagon(randint(0 + screenOffset, width - screenOffset), randint(0 + screenOffset, height - screenOffset), randint(25, screenOffset)),
           Octagon(randint(0 + screenOffset, width - screenOffset), randint(0 + screenOffset, height - screenOffset), randint(25, screenOffset)),]

run = True
selected = None

async def main():

    global objects, run, selected

    while run:
        clock.tick(fps)
        mousex, mousey = pygame.mouse.get_pos()
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                run = False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    run = False
            if event.type == pygame.MOUSEBUTTONUP:
                selected = None
            if event.type == pygame.MOUSEBUTTONDOWN:
                for object in objects:
                    if -3 <= object.pos.x - mousex <= 3 and -3 <= object.pos.y - mousey <= 3:
                        selected = object
                        break

        for object in objects:
            object.colliding = False

        if selected is not None:
            selected.translate(Vector3(mousex, mousey) - selected.pos)

        # Number of combinations is equal to n choose 2 where n is the number of objects in the scene
        for pair in combinations(objects, r=2):
            GJK(*pair)

        screen.fill(black)
        for object in objects:
            color = green if object.colliding else white
            object.display(screen, color)
            pygame.draw.circle(screen, color, (object.pos.x, object.pos.y), 3)
            object.rotate(0.01)
        
        pygame.display.flip()
        await asyncio.sleep(0)

    # pygame.quit()

asyncio.run(main())