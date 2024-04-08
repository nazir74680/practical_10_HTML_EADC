const express = require('express');
const bodyParser = require('body-parser');
const Cloudant = require('@cloudant/cloudant');
const app = express();
const port = process.env.PORT || 7468;

// Cloudant credentials
const url = "https://apikey-v2-1rwrvdtqy58vcgv9tn1kpazxasnz2wmf0qg3tnm96jsi:79a798a454654350e67116eb07328bcc@0c327564-6042-41a7-916e-332518318d02-bluemix.cloudantnosqldb.appdomain.cloud";
const username = "apikey-v2-1rwrvdtqy58vcgv9tn1kpazxasnz2wmf0qg3tnm96jsi";
const password = "79a798a454654350e67116eb07328bcc";
const databaseName = "practical-10";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});


// Initialize Cloudant
const cloudant = Cloudant({ url: url, username: username, password: password });
const db = cloudant.db.use(databaseName);

// Get user data by ID
app.post('/api/get', (req, res) => {
    const id = req.body.id;
    db.get(id, (err, data) => {
        if (err) {
            res.status(404).send('User not found');
        } else {
            res.send(data);
        }
    });
});

// Add New User
app.post('/api/user', (req, res) => {
    const { _id, name, email, phone, city, country, pincode } = req.body;
    db.insert({ _id, name, email, phone, city, country, pincode }, (err, data) => {
        if (err) {
            res.status(500).send('Error adding user');
        } else {
            res.send(data);
        }
    });
});

// Update User Data
app.post('/api/update', (req, res) => {
    const { _id, _rev, name, email, phone, city, country, pincode } = req.body;
    if (!_id || !_rev) {
        res.status(400).send('Bad Request: Missing ID or Revision');
        return;
    }

    db.insert({ _id, _rev, name, email, phone, city, country, pincode }, (err, data) => {
        if (err) {
            res.status(500).send('Error updating user');
        } else {
            res.send(data);
        }
    });
});

// Delete User Data
app.post('/api/delete', (req, res) => {
    const { id, rev } = req.body; 
    if (!id || !rev) {
        res.status(400).send('Bad Request: Missing ID or Revision');
        return;
    }

    db.destroy(id, rev, (err, data) => {
        if (err) {
            console.error(err); // Log the error for debugging purposes
            res.status(500).send('Error deleting user: ' + err.message); // Send detailed error message
        } else {
            res.send(data);
        }
    });
});

// Get All Users Data
app.get('/api/all', (req, res) => {
    db.list({ include_docs: true }, (err, data) => {
        if (err) {
            res.status(500).send('Error fetching users');
        } else {
            const users = data.rows.map(row => row.doc);
            res.send(users);
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});
