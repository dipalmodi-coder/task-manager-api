const app = require('../src/app');
const request = require('supertest');
const User = require('../src/models/user');
const {userOneID, userOne, setupTestDB} = require('./fixtures/db');

// Set up the test suite
beforeEach(setupTestDB);

// Tear down
afterEach(async () => {
    //console.log("Test suite completed..")
});

test('Should not allow user to use password string in password', async () => {
    const response = await request(app).post('/users').send({
        age: 44,
        name: 'Dipal Modi',
        email: 'dipal.modi@gmail.com',
        password: 'Password777!'
    }).expect(400)
});

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        age: 44,
        name: 'Dipal Modi',
        email: 'dipal.modi@gmail.com',
        password: 'MyPass777!'
    }).expect(201)

    // Extract the user from response and check against database
    const user = response.body.user;
    const dbuser = await User.findById(user._id);
    expect(dbuser).not.toBeNull();
    expect(dbuser.tokens).toHaveLength(1);

    // Assertions about whole objects
    expect(response.body).toMatchObject({
        user: {
            age: 44,
            name: 'Dipal Modi',
            email: 'dipal.modi@gmail.com',
          },
        token: dbuser.tokens[0].token
    })
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const dbUser = await User.findById(response.body.user._id);
    expect(dbUser).not.toBeNull();
    expect(dbUser.tokens).toHaveLength(2);
    expect(response.body.token).toBe(dbUser.tokens[1].token);
})

test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: 'email@email.com',
        password: 'thisisnotmypass'
    }).expect(400) 
})

test('Should get profile for logged in user', async () => {
    await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200) 
})

test('Should not get profile for logged in user', async () => {
    await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token + 'test'}`)
    .send()
    .expect(401) 
})

test('Should delete user', async () => {
    const response = await request(app)
            .delete('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200) 

    const dbUser = await User.findById(response.body._id);
    expect(dbUser).toBeNull();
})

test('Should not not delete user', async () => {
    await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token + 'test'}`)
    .send()
    .expect(401) 
})

test('Should be able to upload an avatar', async () => {
    const response = await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/smaller.jpg')
        .expect(200)

    const dbUser = await User.findById(userOneID);
    expect(dbUser).not.toBeNull();
    expect(dbUser.avatar).toEqual(expect.any(Buffer));
})

test('Should update valid user filed', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Dipal Modi'
        })
        .expect(200)

    const dbUser = await User.findById(userOneID);
    expect(dbUser).not.toBeNull();
    expect(dbUser.name).toBe('Dipal Modi');
})

test('Should not update invalid user filed', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Dipal Modi'
        })
        .expect(400)
})


