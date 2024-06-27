const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('./models/User');
const cors = require('cors'); // Import CORS middleware

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer setup for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware configuration
app.use(cors());

// Connect to MongoDB (Update the database name if necessary)
mongoose.connect('mongodb://127.0.0.1/user-auth', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Connection error', err));

// Routes
// Registration Route
// Registration Route
app.post('/users', upload.single('profilePicture'), async (req, res) => {
    try {
        // Check if a user with the same email or username already exists
        const existingUser = await User.findOne({
            $or: [{ email: req.body.email }, { username: req.body.username }],
        });

        if (existingUser) {
            return res.status(400).send('User with the same email or username already exists');
        }

        // If no existing user, proceed to create a new user
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            contact: req.body.contact,
            profilePicture: req.file ? req.file.filename : null,
        });

        await user.save();
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});


// Get Users Route
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update User Route
app.put('/users/:id', upload.single('profilePicture'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.username = req.body.username || user.username;
        user.contact = req.body.contact || user.contact;
        user.profilePicture = req.file ? req.file.filename : user.profilePicture;

        await user.save();
        res.status(200).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete User Route
app.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
