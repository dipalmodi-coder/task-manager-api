const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Task = require('../../src/models/task');
const User = require('../../src/models/user'); 

// Create users
const userOneID = new mongoose.Types.ObjectId();
const userOne = {
    _id: userOneID,
    name: 'Mike',
    email: 'mike@example.com',
    password: '56what!!',
    tokens: [{
        token: jwt.sign({ _id: userOneID }, process.env.JWT_SECRET, { expiresIn: '7 days' })
    }]
}

const userTwoID = new mongoose.Types.ObjectId();
const userTwo = {
    _id: userTwoID,
    name: 'Dipal',
    email: 'dipal.modi@example.com',
    password: 'Pwd111123!@',
    tokens: [{
        token: jwt.sign({ _id: userTwoID }, process.env.JWT_SECRET, { expiresIn: '7 days' })
    }]
}

// Create 1 task for userOne and 2 tasks for userTwo
const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Task one for userOne',
    completed: false,
    owner: userOneID
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Task one for userTwo',
    completed: false,
    owner: userTwoID
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Task one for userTwo',
    completed: true,
    owner: userTwoID
}

const setupTestDB = async () => {
    await User.deleteMany();
    await Task.deleteMany();
    await new User(userOne).save();
    await new User(userTwo).save();
    await new Task(taskOne).save();
    await new Task(taskTwo).save();
    await new Task(taskThree).save();
}

module.exports = {
    userOneID: userOneID,
    userOne: userOne,
    userTwoID: userTwoID,
    userTwo: userTwo,
    setupTestDB: setupTestDB
}