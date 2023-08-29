# Express Clone

## Description

This is a clone of the Express.js framework. It is a lightweight framework that allows you to create a server and handle requests. It is a very simple framework that is easy to use and understand.

## API

### new Express()

- Creates a new instance of the Express framework.

```js
const express = new Express()
```

### express.use(middleware)

- Adds middleware to the middleware stack. Middleware is called in the order it is added.

```js
express.use((req, res, next) => {
  console.log('Middleware 1')
  next()
})
```

### express.get(path, callback)

- Adds a route to the server that only responds to GET requests.

```js
express.get('/', (req, res) => {
  res.send('Hello World!')
})
```

### express.post(path, callback)

- Adds a route to the server that only responds to POST requests.

```js
express.post('/', (req, res) => {
  res.send('Hello World!')
})
```

### express.put(path, callback)

- Adds a route to the server that only responds to PUT requests.

```js
express.put('/', (req, res) => {
  res.send('Hello World!')
})
```

### express.delete(path, callback)

- Adds a route to the server that only responds to DELETE requests.

```js
express.delete('/', (req, res) => {
  res.send('Hello World!')
})
```

### express.listen(port, callback)

- Starts the server on the specified port.

```js
express.listen(3000, () => {
  console.log('Server is listening on port 3000')
})
```
