const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');

const mongoose = require('mongoose');

const router = new express.Router();

router.post("/tasks", auth, async (req, res) => {
    // const task = new Task(req.body);
    // task.owner._id = req.user._id;

    // this can also be done as
    task = new Task({
        ...req.body,
        owner: req.user._id
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
});

// Find task by id
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        res.status(404).send('Task not found!');
        return;
    }

    try {
        const task = await Task.findOne({_id: _id, owner: req.user._id});
        
        if (!task) {
            res.status(404).send('Task not found!');
        }

        await task.populate('owner').execPopulate();
        res.status(200).send(task);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Find all tasks
// Find tasks by filter in querystring
// GET /tasks?completed=true
// GET /tasks?limit=10&skip=0 (limit and skip pagination)
router.get('/tasks', auth, async (req, res) => {
    try {
        const user = req.user;
        const match = {};
        const sort = {};

        if (req.query.completed) {
            match.completed = (req.query.completed === 'true')
        }

        if (req.query.sortBy) {
            const sortOrder = ((req.query.order) && req.query.order === 'asc')? 1 : -1;
            // console.log('order', sortOrder);
            // console.log('sortBy', req.query.sortBy);
            sort[req.query.sortBy] = sortOrder;
        }

        // const tasks = await Task.find({owner: user._id});
        // above line works but it can also be done by using populate function
        await user.populate({
            path: 'tasks',
            match: match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort: sort
            }
        }).execPopulate();

        res.status(200).send(user.tasks);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// Update a task
router.patch('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        res.status(404).send('Task not found!');
        return;
    }

    // Check if valid properties are passed in the req body
    const allowedProperties = ['completed', 'description'];
    const propertiesPassed = Object.keys(req.body);

    const isValidUpdate = propertiesPassed.every((property) => {
        return allowedProperties.includes(property);
    });

    if (!isValidUpdate) {
        // return is important here, since res.send does not stop program execution
        return res.status(400).send('Please check properties to update!');
    }

    try {
        const task = await Task.findOne({_id: _id, owner: req.user._id});

        if (!task) {
            return res.status(404).send('Task not found!');
        }

        propertiesPassed.forEach((property) => {
            task[property] = req.body[property];
        });

        await task.save();

        res.status(200).send(task);
    } catch (error) {
        res.status(400).send(error.message);
    }
});


// Delete task
router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        res.status(404).send('Task not found!');
        return;
    }

    try {
        const task = await Task.findOneAndDelete({_id: _id, owner: req.user._id});
        if (!task) {
            res.status(404).send('Task not found!');
            return;
        }

        res.status(200).send(task);
    } catch (error) {
        res.status(500).send({
            error: error.message
        });
    }
});

module.exports = router
