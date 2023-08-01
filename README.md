
# Running the Application

This application is composed of a backend server and a frontend client, both of which need to be running for the application to work correctly.

## Prerequisites

- [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) (Node.js package manager)
- [Redis](https://redis.io/) server
- [Git](https://git-scm.com/) (optional)

## Getting Started

1. **Clone the repository** (optional)

   If you have Git installed on your machine, you can clone this repository using the following command:
   
   ```
   git clone <repository-url>
   ```

   Replace `<repository-url>` with the URL of this Git repository.

   If you don't have Git, you can simply download the project as a ZIP file.

2. **Set up the Backend**

   Navigate to the `backend` directory of the project:
   
   ```
   cd backend
   ```
   
   Install the necessary dependencies using npm:
   
   ```
   npm install
   ```
   
   Create a `.env` file in the `backend/src` directory to store your environment variables. Use the provided `.env` file as a template. Replace the placeholders with your actual values:
   
   ```
   REDIS_HOST=<your-redis-host>
   REDIS_PORT=<your-redis-port>
   REDIS_PASSWORD=<your-redis-password>
   JWT_SECRET=<your-jwt-secret>
   ```
   
   You can start the server using the following command:
   
   ```
   npm start
   ```

3. **Set up the Frontend**

   Navigate to the `frontend` directory of the project:
   
   ```
   cd ../frontend
   ```
   
   Install the necessary dependencies using npm:
   
   ```
   npm install
   ```
   
   You can start the frontend server using the following command:
   
   ```
   npm start
   ```

4. **Access the Application**

   The application should now be running and accessible in your web browser at `http://localhost:3000`.

## Note

Please make sure your Redis server is running before starting the backend server. The Redis server is used for real-time communication between the backend and frontend.

This setup assumes you have Node.js and npm installed globally on your machine. If not, please download and install the latest LTS version of Node.js, which includes npm, from the official Node.js website.

This guide also assumes that you're running the application locally on your machine. If you're deploying the application to a server, the setup might be slightly different.



# Project Design and Architecture

The project follows a typical Node.js web application structure with a clear separation of concerns. It is built using Express.js for routing, Redis as a data store, and Socket.IO for real-time communication. The application encompasses model, controller, and route components, neatly organized into their respective directories. Here is a closer look at each component:

## 1. Models
Models (`Message.js`, `Room.js`, and `User.js`) encapsulate the data structure and provide utility functions to interact with the data store (Redis). They form an interface to the underlying Redis commands, abstracting away the complexity of direct database operations.

## 2. Controllers
Controllers (`chatController.js`, `roomController.js`, and `userController.js`) contain the business logic of the application. They handle incoming requests, interact with the models to retrieve or manipulate data, and send back responses to the client.

## 3. Routes
Routes (`chatRoutes.js`, `roomRoutes.js`, and `userRoutes.js`) define the API endpoints of the application. They map HTTP methods and URLs to specific controller functions. 

## 4. Middleware
The application uses middleware for various purposes like authentication (`auth.js`). Middleware functions are used to perform operations on the request and response objects before they reach the controller functions. Rate limiting is also applied in `chatRoutes.js` to prevent potential abuse.

Here is a high-level overview of the application structure:

```
.
├── controllers
│   ├── chatController.js
│   ├── roomController.js
│   ├── userController.js
├── models
│   ├── Message.js
│   ├── Room.js
│   ├── User.js
├── routes
│   ├── chatRoutes.js
│   ├── roomRoutes.js
│   ├── userRoutes.js
├── middleware
│   ├── auth.js
```

In terms of architecture, the application follows a pattern similar to MVC (Model-View-Controller), albeit without the Views as it is a RESTful API. The application logic is cleanly separated into models, controllers, and routes, which makes the application more maintainable, scalable, and testable.

The application also leverages real-time communication using Socket.IO, emitting events when certain actions occur, such as when a message is sent or a message's status is updated.

For data storage, the high-performance Redis data store is employed, and its data structures are used creatively to model chat room messages and users. For example, Redis lists are used to store chat messages, Redis hashes for user and message details, and Redis sets to store room members.

For security, the application uses JSON Web Tokens (JWTs) for authentication, which is a standard method for securely transmitting information between parties as a JSON object. HTTP-only cookies are also used to store the JWT on the client-side, providing a layer of security against cross-site scripting (XSS) attacks. Passwords are securely stored using bcrypt for password hashing.

Lastly, to prevent abuse, the application implements express-rate-limit middleware for rate limiting, ensuring the API isn't overwhelmed by too many requests within a short period.



# APP QUESTIONS



## 1. User Registration and Authentication

User Registration and Authentication are essential components of many applications, providing secure user access to personalized data and experiences.

The **registration feature** in the application was implemented such that when a user registers, we take the provided username and password and store them in our database. However, before storing the password, it is hashed using _bcrypt_, a powerful hashing algorithm. The hashing process is a form of one-way encryption that converts the original password into an unrecognizable string of characters. Thus, even if an unauthorized individual gains access to our database, the user's password remains secure and incomprehensible.

For the **login feature**, we compare the input password with the stored hashed password in the database. If the hashed version of the input password matches the stored hash, the user is authenticated. Upon successful authentication, a JSON Web Token (JWT) is generated and returned to the user. JWT is a robust standard for securely transmitting information between parties in the form of a JSON object. The information in the token can be trusted as it is digitally signed.

The motivation behind implementing the login system this way was primarily to provide secure user authentication. The generated JWT token is stored on the user's device and included in every subsequent request. This approach provides a mechanism to authenticate the user for these requests, ensuring that only authorized users can perform particular actions.

By employing JWT, the application can ensure that the server does not need to maintain a record of all authenticated users, thereby enhancing the system's scalability and efficiency. Additionally, JWTs are self-contained, meaning all the necessary user information is stored within the token. This property facilitates stateless, session-less authentication, which is inherently scalable and adaptable to a variety of application needs.

In essence, the driving factors behind this implementation were security, scalability, and efficiency. The application ensures security through hashed passwords and token-based authentication, while scalability and efficiency are realized through the stateless nature of JWT authentication.



## 2. Real-Time Chat

Real-time chat functionality is implemented in the application using WebSockets. This technology provides bi-directional, full-duplex communication channels over a single TCP connection, which is crucial for real-time applications such as chat.

Here's an explanation of the features and the reasoning behind the implementation strategy:

### Joining and Leaving Chat Rooms

The application is designed to allow users to join and leave chat rooms, providing users with flexibility and control over their chat experience.

When a room is joined, the user is added to a members set in Redis that corresponds to that room. Similarly, when a room is left, the user is removed from this set. This approach ensures easy management of the list of active members in a room and guarantees that only members of a room can send or receive messages in that room.

The choice of a set as a data structure and Redis as a database stems from the need for efficient operations, as both adding and removing members from a set in Redis are O(1) operations.

### Sending Messages in Real-Time

Real-time message sending is enabled through the WebSocket protocol's capacity for bi-directional, full-duplex communication. When a message is sent, a WebSocket event is emitted to the server, which then broadcasts the message to all users in the room.

Each message is stored in Redis as a hash with fields for the sender, text, and timestamp. The message's ID is also stored in a list associated with the room. This design ensures efficient retrieval of all messages for a room, leveraging the fast operations of Redis data structures.

### Message Information

In each message, information about the user who sent it is included. This provides transparency and accountability in the chat room. The sender's username is part of the message hash in Redis and is transmitted with each message to all clients in the room.

### Real-Time Message Display

For real-time message display, the WebSocket connection pushes each new message to all clients in the room as soon as it is received by the server. This ensures that all users in the room can see the message instantly, creating a real-time chat experience.

This real-time functionality is a crucial feature of modern chat applications, and its implementation with WebSockets provides a fast, responsive user experience.

In conclusion, the design and implementation strategy for these features are driven by the requirements of a real-time chat application and the capabilities of the chosen technologies, namely WebSocket for real-time, bi-directional communication, and Redis for efficient data storage and retrieval.



## 3. Message Storage Implementation

### How It's Implemented

The application uses a Redis database for the storage and retrieval of messages. In the Redis data model, messages are stored using hash data structures, and a list data structure is used to store message IDs associated with each chat room.

When a message is sent, a new message ID is created by incrementing a counter in the database (this is done using the `Message.incr("message:id")` method). The message details, including the sender's username, the message text, and the timestamp, are then stored as a hash in the database (using the `Message.hset` method). The message ID is also added to a list associated with the room where the message was sent (using the `Message.lpush` method).

When a user joins a chat room, the system retrieves all message IDs associated with that room (using the `Message.lrange` method). Then, for each message ID, the system retrieves the message details from the hash where they were stored.

### Reasoning Behind This Implementation

This approach provides several advantages:

1. **Efficient Retrieval of Recent Messages:** Redis lists are ordered collections of items. When a new message is added to a room's list, it's put at the front. Therefore, retrieving the most recent messages is as simple as fetching a certain number of items from the front of the list. This operation is highly efficient.

2. **Scalability:** Redis is known for its high performance and ability to handle large volumes of data. By using Redis for message storage, the application can scale to support a large number of simultaneous users and messages.

3. **Real-time Experience:** When a new message is stored, it's also emitted in real time to all connected clients. This ensures that all users in a chat room can see new messages immediately as they are sent.

4. **Persistence:** By storing messages in a database, we ensure that the chat history is preserved and can be retrieved later. This is particularly important for users who join a chat room after a conversation has started, as they can catch up on what was discussed before they joined.



## 4. Rate Limiting in a Chat Application

Rate Limiting is a crucial aspect of maintaining the integrity and usability of an application. Its primary purpose is to prevent users or automated bots from overusing specific parts of an application, thereby preventing spamming and protecting the application from denial of service attacks. In the context of a chat application, rate limiting ensures that users cannot flood the application with messages, which can disrupt the user experience for others.

### Implementation Details

In the provided file, rate limiting is implemented using the `rate-limiter-flexible` package with a Redis store, specifically with the `RateLimiterRedis` class. The rate limiter is set up to allow a maximum of 10 points (requests) per 60 seconds for each unique IP address.

Here's how it's implemented:

1. The Redis client is initialized with the necessary configurations.
2. A `RateLimiterRedis` instance is created with the Redis client as the `storeClient`, a `keyPrefix` for the keys stored in Redis, a `points` value that specifies the maximum number of requests allowed, and a `duration` that specifies the length of time before the points reset.
3. Each time a user tries to send a message (either a regular message or a private message), the rate limiter attempts to consume a point for the user's socket ID. If the consumption is successful (i.e., the user has not exceeded the limit), the message is processed and sent. If the consumption fails (i.e., the user has hit the limit), a message is logged indicating that the rate limit has been exceeded for that socket ID, and the message is not processed or sent.

### Benefits of this Implementation

The reason for implementing rate limiting in this manner is that it provides a robust, scalable, and efficient way to handle rate limiting across multiple nodes if the application were to be scaled out. The `rate-limiter-flexible` package provides a convenient abstraction for rate limiting, and Redis is a high-performance in-memory data store that can handle the rate limiting data.

This setup provides a balance between user freedom and system protection, as it allows a reasonable number of requests (10 requests per minute), which should be sufficient for regular usage, but prevents misuse of the system by limiting excessive requests.



