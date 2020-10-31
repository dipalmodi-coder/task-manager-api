// Require npm module - mongoose
const mongoose = require('mongoose');

// MongoDB client config options
const mongoClientOptions = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
};

const connectionURL = process.env.MONGODB_URL;

mongoose.connect(connectionURL, mongoClientOptions);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to database - ' + connectionURL)
});