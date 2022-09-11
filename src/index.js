const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userAccount = users.find(user => user.username === username)

  if(!userAccount) {
    return response.status(404).json({ error: 'User account does not exist'})
  }

  request.userAccount = userAccount

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAccountAlreadyExists = users.some((user) => user.username === username)

  if(userAccountAlreadyExists) {
    return response.status(400).json({ error: 'User account already exists'})
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  })

  return response.status(201).json({    
    id: uuidv4(),
    name,
    username,
    todos: []})
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { userAccount } = request

  return response.status(200).json(userAccount.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { userAccount } = request;
  const { title, deadline } = request.body;

  userAccount.todos.push({
      id: uuidv4(),
      title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date()
  })

  return response.status(201).json(userAccount.todos)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {userAccount} = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const checkTodoExist = userAccount.todos.find(todos => todos.id === id)

  if(!checkTodoExist) {
    return response.status(404).json({ error: 'Todo does not exist'})
  }

  for (const t of userAccount.todos) {
    if (t.id === id) {
      t.title = title,
      t.deadline = deadline
    }
  }

  return response.status(201).json(userAccount.todos)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {userAccount} = request;
  const { id } = request.params;

  const checkTodoExist = userAccount.todos.find(todos => todos.id === id)

  if(!checkTodoExist) {
    return response.status(404).json({ error: 'Todo does not exist'})
  }

  for (const t of userAccount.todos) {
    if (t.id === id) {
      t.done = true
    }
  }

  return response.status(200).json(userAccount.todos)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {userAccount} = request;
  const { id } = request.params;

  const checkTodoExist = userAccount.todos.find(todos => todos.id === id)

  if(!checkTodoExist) {
    return response.status(404).json({ error: 'Todo does not exist'})
  }

  const filterTodo = userAccount.todos.findIndex(key => key.id === id)

  if (filterTodo === 1) {
    userAccount.todos.splice(filterTodo, 1);
  }
  
  return response.status(200).json(userAccount.todos)
});

module.exports = app;