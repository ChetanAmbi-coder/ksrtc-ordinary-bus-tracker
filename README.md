# 🚍 KSRTC Ordinary Bus Tracker

A full-stack public-transport tracking platform focused on **ordinary KSRTC buses**, with the long-term goal of providing route information, schedules, ETA, and eventually real-time bus location.

> **Important:** The initial version will use hardcoded/demo data. Real-time location will be integrated only when an authorized and technically reliable location source becomes available, such as an official GPS feed, approved driver-device telemetry, or another authorized data source.

---

# 🎯 Final Goal

Build a production-ready public transportation platform consisting of:

* Responsive website
* Android/iOS mobile application
* Backend REST API
* MySQL relational database
* MongoDB NoSQL database where appropriate
* Real-time bus-location infrastructure
* ETA system
* Route and stop information
* User accounts
* Notifications
* Admin system
* Future AI-powered transportation assistance

---

# 🧠 Core Idea

The platform should not depend on one particular GPS hardware solution.

The architecture should support multiple possible location sources:

```text
                    LOCATION SOURCES
                           │
             ┌─────────────┼─────────────┐
             │             │             │
        GPS Hardware   Driver Device   Official API
             │             │             │
             └─────────────┼─────────────┘
                           ↓
                      Backend API
                           ↓
                    Location Service
                           ↓
                    ETA / Route Engine
                           ↓
              ┌────────────┴────────────┐
              │                         │
           Website                    Mobile App
```

This means the application can be developed even before every ordinary bus has dedicated GPS hardware.

---

# 🖥️ Technology Stack

## Current Frontend

* HTML5
* CSS3
* JavaScript
* Fetch API
* JSON
* Async/Await
* Promises
* DOM manipulation

## Future Web Frontend

* React.js
* Next.js

## Mobile

* React Native

## Backend

* Java
* Spring Boot
* Spring Web
* Spring Data JPA
* Spring Security
* JWT authentication

## Databases

### MySQL

For structured relational data:

* Users
* Buses
* Routes
* Stops
* Schedules
* Favorites
* Administrative data

### MongoDB

Potentially for:

* Location updates
* GPS telemetry
* Tracking events
* Flexible/high-volume tracking data

> Database selection should be based on actual requirements. MongoDB should not be added merely because the data is "non-linear."

## Communication

```text
Frontend
   ↓
HTTP/HTTPS
   ↓
REST API
   ↓
Spring Boot
   ↓
Database
```

---

# 🏗️ Development Architecture

```text
                         USERS
                           │
              ┌────────────┴────────────┐
              │                         │
          WEBSITE                  MOBILE APP
              │                         │
        Next.js/React             React Native
              │                         │
              └────────────┬────────────┘
                           │
                       REST API
                           │
                     Spring Boot
                           │
             ┌─────────────┴─────────────┐
             │                           │
           MySQL                     MongoDB
             │                           │
       Structured data            Tracking data
             │                           │
             └─────────────┬─────────────┘
                           │
                     Location System
                           │
              ┌────────────┴────────────┐
              │                         │
        GPS Hardware              Driver Device
              │                         │
              └────────────┬────────────┘
                           │
                       Live Data
```

---

# 🛣️ COMPLETE DEVELOPMENT ROADMAP

## PHASE 0 — Project Planning

### Step 1 — Define the problem

Understand the passenger problem:

* Finding ordinary buses
* Knowing routes
* Knowing stops
* Knowing schedules
* Knowing expected arrival
* Eventually knowing live location

### Step 2 — Define MVP

Initial MVP should focus on:

* Bus listing
* Route listing
* Stop information
* Search
* Filters
* Bus details
* ETA simulation
* Responsive UI

### Step 3 — Create project directory

Completed.

```text
ksrtc-ordinary-bus-tracker/
```

### Step 4 — Create project documentation

Completed:

```text
README.md
PROGRESS.md
```

---

# PHASE 1 — HTML FOUNDATION

Build the initial website using pure HTML.

Learn and implement:

* HTML document structure
* Semantic HTML
* Navbar
* Header
* Main content
* Sections
* Footer
* Forms
* Inputs
* Buttons
* Cards
* Lists
* Tables
* Links
* Images
* Accessibility basics

Create:

```text
frontend/
├── index.html
├── css/
├── js/
└── assets/
```

---

# PHASE 2 — CSS DESIGN

Build the complete visual system.

Implement:

* CSS reset
* Typography
* Colors
* Spacing
* Buttons
* Cards
* Navbar
* Forms
* Flexbox
* Grid
* Responsive design
* Media queries
* Mobile layout
* Hover states
* Focus states
* Loading states
* Empty states
* Error states

Target:

```text
Desktop
Tablet
Mobile
```

---

# PHASE 3 — JAVASCRIPT

Convert the static website into an interactive application.

Implement:

* Variables
* Data types
* Operators
* Conditions
* Loops
* Functions
* Arrays
* Objects
* Array methods
* DOM selection
* DOM manipulation
* Events
* Event listeners
* Forms
* Validation
* Template literals
* Modules
* Local storage

---

# PHASE 4 — HARDCODED BUS DATA

Create the first data model.

Example:

```text
Bus
├── busId
├── busNumber
├── route
├── status
├── currentStop
├── nextStop
├── eta
└── stops
```

Create multiple buses and routes.

The UI should be generated from JavaScript data instead of manually writing every bus card.

---

# PHASE 5 — SEARCH AND FILTER

Implement:

* Bus search
* Route search
* Stop search
* Status filter
* Route filter
* ETA sorting
* Empty search result
* Clear search

Flow:

```text
User Input
    ↓
JavaScript
    ↓
Filter Data
    ↓
Generate UI
```

---

# PHASE 6 — BUS DETAILS

Create a detailed bus page/view.

Display:

* Bus number
* Route
* Current stop
* Next stop
* ETA
* Status
* Stop sequence
* Schedule
* Bus information

---

# PHASE 7 — SIMULATED LIVE TRACKING

Before real GPS exists, simulate movement.

Example:

```text
Mysuru
   ↓
Srirangapatna
   ↓
Mandya
   ↓
Maddur
```

Simulate:

* Current stop
* Next stop
* ETA
* Status
* Movement

Use JavaScript timers where appropriate.

---

# PHASE 8 — ASYNC JAVASCRIPT

Study and document:

```text
Synchronous
     ↓
Asynchronous
     ↓
Callback concept
     ↓
Promise
     ↓
.then()
     ↓
async
     ↓
await
```

Understand why asynchronous programming is necessary for API communication.

---

# PHASE 9 — FETCH API

Replace some hardcoded data with API-based data.

Learn:

```text
fetch()
   ↓
Promise
   ↓
response
   ↓
response.json()
   ↓
JavaScript object/data
   ↓
UI
```

Implement:

* GET request
* Response handling
* JSON conversion
* Error handling
* Loading state
* Empty state

---

# PHASE 10 — API / JSON

Understand:

* What an API is
* What REST means
* HTTP methods
* GET
* POST
* PUT/PATCH
* DELETE
* HTTP status codes
* Request
* Response
* JSON
* Headers
* Query parameters
* Path parameters

---

# PHASE 11 — REACT.JS

Rebuild the frontend using React.

Learn:

* Components
* JSX
* Props
* State
* Events
* Conditional rendering
* Lists
* Keys
* Forms
* Hooks
* useState
* useEffect
* Component architecture
* Reusable components
* API calls

Create components such as:

```text
Navbar
SearchBar
BusCard
RouteCard
StopCard
BusDetails
ETA
StatusBadge
Footer
```

---

# PHASE 12 — NEXT.JS

Move the web application toward production architecture.

Learn:

* Next.js project structure
* Routing
* Layouts
* Pages
* Server/client concepts
* Data fetching
* Metadata
* SEO
* Environment variables
* Production builds
* Deployment

---

# PHASE 13 — JAVA

Strengthen Java for backend development.

Learn:

* Variables
* Data types
* Operators
* Conditions
* Loops
* Methods
* Arrays
* Strings
* OOP
* Classes
* Objects
* Encapsulation
* Inheritance
* Polymorphism
* Abstraction
* Interfaces
* Collections
* Exception handling
* Generics
* Streams
* Lambda expressions
* File handling
* Multithreading fundamentals

---

# PHASE 14 — SPRING BOOT

Build the backend.

Learn:

* Spring Boot
* Project structure
* Maven/Gradle
* Controllers
* Services
* Repositories
* Dependency injection
* REST APIs
* DTOs
* Validation
* Exception handling
* Configuration
* Profiles
* Environment variables
* Logging

Architecture:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

---

# PHASE 15 — MYSQL

Design the relational database.

Potential tables:

```text
users
buses
routes
stops
route_stops
schedules
favorites
```

Learn:

* Database design
* Primary keys
* Foreign keys
* Relationships
* One-to-one
* One-to-many
* Many-to-many
* SQL
* SELECT
* INSERT
* UPDATE
* DELETE
* JOIN
* Indexes
* Transactions
* Normalization

---

# PHASE 16 — SPRING DATA JPA

Connect Spring Boot to MySQL.

Learn:

* Entities
* Repositories
* Relationships
* Queries
* JPA
* Hibernate
* Transactions

Build APIs such as:

```text
GET    /api/buses
GET    /api/buses/{id}
GET    /api/routes
GET    /api/routes/{id}
GET    /api/stops
POST   /api/favorites
DELETE /api/favorites/{id}
```

---

# PHASE 17 — MONGODB

Introduce MongoDB only where it makes architectural sense.

Potential tracking document:

```text
{
    busId,
    latitude,
    longitude,
    speed,
    timestamp,
    status
}
```

Learn:

* Documents
* Collections
* Queries
* Indexing
* MongoDB with Spring Boot
* Data modeling

---

# PHASE 18 — FRONTEND ↔ BACKEND

Connect Next.js with Spring Boot.

```text
Next.js
    ↓
HTTP request
    ↓
Spring Boot REST API
    ↓
Service
    ↓
Database
    ↓
JSON response
    ↓
Next.js
    ↓
UI
```

Replace frontend hardcoded data with real backend data.

---

# PHASE 19 — AUTHENTICATION

Implement:

* Registration
* Login
* Logout
* Password hashing
* JWT
* Spring Security
* Protected APIs
* User roles

Roles:

```text
USER
ADMIN
OPERATOR
```

---

# PHASE 20 — ADMIN DASHBOARD

Build an admin system.

Admin should be able to manage:

* Buses
* Routes
* Stops
* Schedules
* Users
* Bus status
* Data corrections

---

# PHASE 21 — REACT NATIVE MOBILE APP

Build the mobile application.

Learn:

* React Native
* Components
* Navigation
* Screens
* State
* API calls
* Forms
* Storage
* Permissions
* Location APIs
* Notifications
* Android builds

Screens:

```text
Home
Search
Bus Details
Route
Stops
Favorites
Profile
Settings
```

The mobile app consumes the same Spring Boot backend.

---

# PHASE 22 — LOCATION SYSTEM

Do NOT assume that every bus already has GPS.

Support multiple possible sources:

```text
GPS hardware
Driver smartphone
Official transport API
Authorized telemetry system
```

The backend should receive location data in a consistent format.

Example:

```text
busId
latitude
longitude
speed
timestamp
```

---

# PHASE 23 — REAL-TIME TRACKING

Implement:

* Location updates
* Current bus position
* Route position
* Current stop
* Next stop
* ETA
* Last updated time
* Connection status

Potential technologies can be evaluated later:

* WebSockets
* Server-Sent Events
* Polling
* Push notifications

Choose based on actual requirements.

---

# PHASE 24 — ETA ENGINE

Build an ETA system.

Initially:

```text
Static schedule
      ↓
Estimated ETA
```

Later:

```text
Live GPS
    ↓
Speed
    ↓
Route
    ↓
Traffic/context data
    ↓
ETA calculation
```

---

# PHASE 25 — MAP INTEGRATION

Add a map interface.

Display:

* Bus location
* Stops
* Route
* User location where appropriate
* Destination
* Bus movement

Use a suitable mapping provider after evaluating:

* Cost
* API limits
* Licensing
* Accuracy
* India coverage

---

# PHASE 26 — NOTIFICATIONS

Add:

* Bus approaching
* ETA changes
* Route updates
* Service alerts
* Favorite route notifications

---

# PHASE 27 — PERFORMANCE

Optimize:

* API requests
* Database queries
* Images
* JavaScript
* React rendering
* Next.js performance
* Mobile performance
* Location update frequency

---

# PHASE 28 — SECURITY

Implement:

* HTTPS
* Authentication
* Authorization
* Password hashing
* JWT security
* Input validation
* API rate limiting
* CORS configuration
* Secure environment variables
* SQL injection protection
* Logging
* Error handling

---

# PHASE 29 — TESTING

Frontend:

* Component testing
* UI testing
* Browser testing

Backend:

* Unit tests
* Integration tests
* API tests

Also test:

* Authentication
* Database
* Location updates
* ETA
* Error conditions

---

# PHASE 30 — DEPLOYMENT

Deploy:

```text
Frontend
     ↓
Cloud hosting

Backend
     ↓
Cloud/VPS

MySQL
     ↓
Managed database

MongoDB
     ↓
Managed database
```

Configure:

* Environment variables
* Domain
* HTTPS
* CI/CD
* Production logging
* Monitoring
* Backups

---

# PHASE 31 — MOBILE RELEASE

Prepare:

* App icon
* Splash screen
* App name
* Package ID
* Permissions
* Privacy policy
* Production build
* Testing
* Google Play release

Later consider iOS if appropriate.

---

# PHASE 32 — PRODUCTION MONITORING

Monitor:

* Server health
* API errors
* Database health
* Location failures
* Application crashes
* User activity
* Performance

---

# PHASE 33 — AI FEATURES

Only after the normal system works reliably.

Possible AI features:

```text
AI route assistant
AI travel recommendations
Natural-language bus search
ETA explanation
Alternative route suggestions
Passenger support chatbot
Demand prediction
Delay prediction
```

Example:

```text
User:

"I need to reach Mandya from Mysuru
around 8 PM."

        ↓

AI + Transit Data

        ↓

Recommended buses
ETA
Route
Alternatives
```

AI should improve the transportation system rather than replace its core functionality.

---

# 🏁 FINAL PRODUCT

The final system should look approximately like:

```text
                         USERS
                           │
              ┌────────────┴────────────┐
              │                         │
           WEBSITE                    APP
       Next.js/React              React Native
              │                         │
              └────────────┬────────────┘
                           │
                        REST API
                           │
                     Spring Boot
                           │
             ┌─────────────┴─────────────┐
             │                           │
           MySQL                     MongoDB
             │                           │
             └─────────────┬─────────────┘
                           │
                   Location System
                           │
                  ┌────────┴────────┐
                  │                 │
             GPS Hardware      Driver Device
                  │                 │
                  └────────┬────────┘
                           │
                     Live Location
                           │
                     ETA Engine
                           │
                    AI Services
```

---

# 🚨 Critical Project Principle

The project must remain useful even if live GPS is unavailable.

Therefore:

```text
Static Information
       ↓
Schedule
       ↓
Estimated ETA
       ↓
Live Location
       ↓
AI-enhanced predictions
```

Each stage should be independently useful.

---

# 📌 Current Status

## Completed

* Project idea
* Initial implementation planning
* Project directory
* Technology-stack planning
* MVP direction
* `README.md`
* `PROGRESS.md`

## Current Stage

**Phase 1 — Frontend foundation**

Current technology:

```text
HTML
CSS
JavaScript
```

## Next Immediate Goal

Build the first frontend version using:

```text
HTML
CSS
JavaScript
```

with hardcoded bus data.

Do NOT start React, Spring Boot, MySQL, MongoDB, or React Native yet.

Build the foundation first.
