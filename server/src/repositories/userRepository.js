const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const mongoose = require('mongoose');

const DB_FILE = path.join(__dirname, '../../db_mock.json');

const getStore = () => {
  if (fs.existsSync(DB_FILE)) {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  }
  return { users: [], tokens: [] };
};

const saveStore = (store) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2));
};

const findOne = async (query) => {
  if (mongoose.connection.readyState === 1) {
    return User.findOne(query);
  }
  
  // Fallback to file-based mock
  const store = getStore();
  return store.users.find(u => {
    return Object.keys(query).every(key => u[key] === query[key]);
  });
};

const create = async (userData) => {
  if (mongoose.connection.readyState === 1) {
    const user = new User(userData);
    return user.save();
  }

  // Fallback to file-based mock
  const store = getStore();
  const newUser = { ...userData, _id: Date.now().toString(), id: Date.now().toString(), createdAt: new Date() };
  store.users.push(newUser);
  saveStore(store);
  return newUser;
};

module.exports = {
  findOne,
  create
};
