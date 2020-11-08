const app = require('../src/app');
const Task = require('../src/models/task');
const User = require('../src/models/user');
const request = require('supertest');
const {userOneID, userOne, setupTestDB, userTwo, userTwoID} = require('./fixtures/db');
const mongoose = require('mongoose');

// Set up the test suite
beforeEach(setupTestDB);

test('Should create a task for existing user', async () => {
    const taskID = new mongoose.Types.ObjectId();
    const response = await request(app).post('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                _id: taskID,
                description: 'This is a task on Heroku poduction',
                completed: true
            }).expect(201);

    const dbTask = await Task.findOne({_id: taskID});
    expect(dbTask).not.toBeNull();
    expect(dbTask.description).toEqual('This is a task on Heroku poduction');
});

test('Should get all tasks for existing user', async () => {
    const response = await request(app).get('/tasks')
            .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
            .send()
            .expect(200)

    expect(response.body).toHaveLength(2);
})