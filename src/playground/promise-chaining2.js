require('../db/mongoose')
const Task = require('../models/task')

// const task1 = new Task({
//     completed: true,
//     description: 'dont click on phishing url'
// });

// task1.save().then((task1) => {
//     console.log(task1);
// }).catch((error) => {
//     console.log(error);
// });

// Task.findByIdAndDelete('5f76f54a4725361cb85a6629').then((task) => {
//     return Task.count({completed: true});
// }).then((count) => {
//     console.log(count);
// }).catch((error) => {
//     console.log(error);
// })

const updateTasksAndCount = async (id, completed) => {
    const task = await Task.findByIdAndUpdate(id, {completed: completed});
    const count = await Task.countDocuments({completed});
    return count;
}

updateTasksAndCount('5f76f59582b3541f5cd4942d', true).then((count) => {
    console.log('count', count);
}).catch((error) => {
    console.log(error);
})