import { Lesson } from '@/types';

export const lessonExample: Lesson = {
  id: 'code-execution-example',
  moduleId: 'intro-to-python',
  title: 'Hands-on Python Programming',
  duration: 15,
  objectives: [
    'Write and execute Python code in the browser',
    'Understand functions and variables',
    'Complete interactive coding exercises',
    'Debug simple Python programs'
  ],
  content: `
# Hands-on Python Programming

Welcome to your first interactive Python lesson! In this lesson, you'll write and execute real Python code directly in your browser.

## Getting Started with Python

Python is a versatile programming language known for its simplicity and readability. Let's start with the basics.

### Your First Python Program

Click the "Run" button to execute this code:

<SimpleCodeRunner
  code="# This is a comment in Python
print('Hello, Python learner!')
print('Welcome to interactive coding!')

# Let's do some math
result = 5 + 3
print(f'5 + 3 = {result}')"
  language="python"
/>

### Variables and Data Types

Variables store data that we can use in our programs. Try modifying these variables:

<SimpleCodeRunner
  code="# Different types of variables
name = 'Alice'  # String
age = 25        # Integer
height = 5.6    # Float
is_student = True  # Boolean

print(f'Name: {name}')
print(f'Age: {age}')
print(f'Height: {height} feet')
print(f'Is student: {is_student}')"
  language="python"
  editable={true}
/>

## Functions: Reusable Code Blocks

Functions help us organize code into reusable pieces. Here's how to create and use them:

<CodeSnippet
  code="def greet(name):
    '''This function greets a person with their name'''
    return f'Hello, {name}! Nice to meet you.'

# Call the function
message = greet('Python Programmer')
print(message)"
  language="python"
  title="Function Definition Example"
/>

### Exercise 1: Create Your Own Function

Complete this function to calculate the area of a rectangle:

<LessonCodeBlock
  type="runner"
  lessonId="code-execution-example"
  exerciseId="rectangle-area"
  title="Calculate Rectangle Area"
  instructions="Complete the calculate_area function to return the area of a rectangle (width × height)"
  code="def calculate_area(width, height):
    # TODO: Calculate and return the area
    # Hint: Area = width × height
    pass

# Test your function
print(calculate_area(5, 3))   # Should print: 15
print(calculate_area(10, 7))  # Should print: 70
print(calculate_area(2.5, 4)) # Should print: 10.0"
  solution="def calculate_area(width, height):
    # Calculate and return the area
    area = width * height
    return area

# Test your function
print(calculate_area(5, 3))   # Should print: 15
print(calculate_area(10, 7))  # Should print: 70
print(calculate_area(2.5, 4)) # Should print: 10.0"
  expectedOutput="15\n70\n10.0"
  hints={[
    "Remember that area is calculated by multiplying width and height",
    "Use the * operator for multiplication",
    "Don't forget to return the result using the return statement"
  ]}
  language="python"
/>

## Working with Lists

Lists are collections of items. Let's explore how to use them:

<SimpleCodeRunner
  code="# Create a list of fruits
fruits = ['apple', 'banana', 'orange', 'mango']

# Print the list
print('All fruits:', fruits)

# Access individual items (indexing starts at 0)
print('First fruit:', fruits[0])
print('Last fruit:', fruits[-1])

# Add a new fruit
fruits.append('grape')
print('After adding grape:', fruits)

# Count the fruits
print(f'Total fruits: {len(fruits)}')"
  language="python"
  editable={true}
/>

### Exercise 2: List Operations

Complete this exercise to practice working with lists:

<LessonCodeBlock
  type="runner"
  lessonId="code-execution-example"
  exerciseId="list-operations"
  title="Shopping List Manager"
  instructions="Complete the function to add an item to the shopping list only if it's not already there"
  code="def add_to_shopping_list(shopping_list, item):
    # TODO: Add the item to shopping_list only if it's not already in the list
    # Return the updated list
    pass

# Test your function
my_list = ['milk', 'bread', 'eggs']
print(add_to_shopping_list(my_list, 'butter'))  # Should add butter
print(add_to_shopping_list(my_list, 'milk'))    # Should not add milk again"
  solution="def add_to_shopping_list(shopping_list, item):
    # Add the item only if it's not already in the list
    if item not in shopping_list:
        shopping_list.append(item)
    return shopping_list

# Test your function
my_list = ['milk', 'bread', 'eggs']
print(add_to_shopping_list(my_list, 'butter'))  # Should add butter
print(add_to_shopping_list(my_list, 'milk'))    # Should not add milk again"
  expectedOutput="['milk', 'bread', 'eggs', 'butter']\n['milk', 'bread', 'eggs', 'butter']"
  hints={[
    "Use the 'in' operator to check if an item is in the list",
    "Use the append() method to add items to the list",
    "Don't forget to return the list at the end"
  ]}
  language="python"
/>

## Advanced Code Editor

For more complex programs, use our full-featured code editor:

<CodeSandbox
  lessonId="code-execution-example"
  initialCode="# Advanced Python Example
# This editor supports multiple files, packages, and more!

import math
import random

class Student:
    def __init__(self, name, grade):
        self.name = name
        self.grade = grade
    
    def __str__(self):
        return f'{self.name} (Grade: {self.grade})'
    
    def passed(self):
        return self.grade >= 60

# Create some students
students = [
    Student('Alice', 85),
    Student('Bob', 72),
    Student('Charlie', 58),
    Student('Diana', 91)
]

# Find who passed
print('Students who passed:')
for student in students:
    if student.passed():
        print(f'  ✓ {student}')
    else:
        print(f'  ✗ {student}')

# Calculate average grade
average = sum(s.grade for s in students) / len(students)
print(f'\\nClass average: {average:.1f}')

# Random encouragement
encouragements = [
    'Great job!',
    'Keep it up!',
    'You're doing amazing!',
    'Excellent work!'
]
print(f'\\n{random.choice(encouragements)}')"
  language="python"
  title="Advanced Python Editor"
  description="This editor supports classes, imports, and more advanced Python features"
  height="500px"
  enableSharing={true}
/>

## Loops and Iteration

Loops allow us to repeat code. Here are the two main types in Python:

<CodeSnippet
  code="# For loop - iterate over a sequence
for i in range(5):
    print(f'Count: {i}')

# While loop - repeat while condition is true
count = 0
while count < 3:
    print(f'While count: {count}')
    count += 1"
  language="python"
  title="Loop Examples"
/>

### Final Challenge: FizzBuzz

Complete the classic FizzBuzz challenge:

<LessonCodeBlock
  type="sandbox"
  lessonId="code-execution-example"
  exerciseId="fizzbuzz"
  title="FizzBuzz Challenge"
  instructions="Print numbers 1 to 15, but: print 'Fizz' for multiples of 3, 'Buzz' for multiples of 5, and 'FizzBuzz' for multiples of both"
  code="# FizzBuzz Challenge
# Print numbers from 1 to 15 with these rules:
# - If divisible by 3: print 'Fizz'
# - If divisible by 5: print 'Buzz'  
# - If divisible by both: print 'FizzBuzz'
# - Otherwise: print the number

for i in range(1, 16):
    # TODO: Add your logic here
    print(i)  # Replace this with your solution"
  solution="# FizzBuzz Challenge
for i in range(1, 16):
    if i % 3 == 0 and i % 5 == 0:
        print('FizzBuzz')
    elif i % 3 == 0:
        print('Fizz')
    elif i % 5 == 0:
        print('Buzz')
    else:
        print(i)"
  expectedOutput="1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz"
  hints={[
    "Use the modulo operator (%) to check if a number is divisible by another",
    "Check for divisibility by both 3 and 5 first",
    "Use if/elif/else statements to handle the different cases"
  ]}
  language="python"
/>

## Congratulations! 🎉

You've completed your first interactive Python lesson! You've learned:

- ✅ How to write and execute Python code
- ✅ Variables and data types
- ✅ Functions and how to create them
- ✅ Working with lists
- ✅ Using loops for iteration
- ✅ Solving programming challenges

Keep practicing with the code editors above, and experiment with your own ideas!
`,
  resources: [
    {
      title: 'Python Official Documentation',
      url: 'https://docs.python.org/3/',
      type: 'article'
    },
    {
      title: 'Python Cheat Sheet',
      url: 'https://www.pythoncheatsheet.org/',
      type: 'tool'
    }
  ]
};