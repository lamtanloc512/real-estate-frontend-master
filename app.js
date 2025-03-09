const express = require('express');
const path = require('path');
// Define routes
// const routes = require('./routes');

const app = express();
const PORT = 3000;

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Set the admin views directory
app.set('adminviews', path.join(__dirname, 'adminviews'));

// Serve static files (css, images,...) from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the "src" directory for development purposes
app.use('/src', express.static(path.join(__dirname, 'src')));

// Serve static files for AdminLTE from the `adminviews/dist` directory
app.use('/plugins', express.static(path.join(__dirname, 'adminviews/plugins')));
app.use('/dist', express.static(path.join(__dirname, 'adminviews/dist')));
app.use('/styles', express.static(path.join(__dirname, 'adminviews/styles')));
app.use('/admin-src', express.static(path.join(__dirname, 'adminviews/src')));

// Import routes and pass the `app` instance
const routes = require('./routes')(app);
// use routes
app.use('/', routes);

// Start the server on port 3000
app.listen(PORT, () => {
});
