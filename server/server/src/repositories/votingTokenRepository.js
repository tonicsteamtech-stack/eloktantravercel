const fs = require('fs');
const path = require('path');
const VotingToken = require('../models/VotingToken');
const mongoose = require('mongoose');

const DB_FILE = path.join(__dirname, '../../db_mock.json');

const getStore = () => {
    if (fs.existsSync(DB_FILE)) {
      try {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      } catch (e) {
        return { users: [], tokens: [] };
      }
    }
    return { users: [], tokens: [] };
};

const saveStore = (store) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2));
};

const findOne = async (query) => {
    if (mongoose.connection.readyState === 1) {
      return VotingToken.findOne(query);
    }
    const store = getStore();
    return store.tokens.find(t => {
      return Object.keys(query).every(key => t[key] === query[key]);
    });
};

const create = async (tokenData) => {
    if (mongoose.connection.readyState === 1) {
      const token = new VotingToken(tokenData);
      return token.save();
    }
    const store = getStore();
    const newToken = { ...tokenData, _id: Date.now().toString(), createdAt: new Date() };
    store.tokens.push(newToken);
    saveStore(store);
    return newToken;
};

module.exports = {
    findOne,
    create
};
