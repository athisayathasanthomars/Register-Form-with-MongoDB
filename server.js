const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const port = 3019;

const app = express();
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));

// Connect to the database and specify the database name
mongoose.connect('mongodb+srv://thomarsthuvaa:200134702209Tt%40@sunshinecluster.k7e7q.mongodb.net/Sunshine_MIS');
const db = mongoose.connection;

db.once('open', () => {
    console.log("MongoDB connection successful");
});

// Schema for the counter collection to track the customer ID
const counterSchema = new mongoose.Schema({
    name: String,
    seq: Number
});

const Counter = mongoose.model("counter", counterSchema,"counter");

// Initialize the counter for "customer" if it doesn’t exist
const initializeCounter = async () => {
    const counter = await Counter.findOne({ name: "customer_id" });
    if (!counter) {
        await new Counter({ name: "customer_id", seq: 0 }).save();
    }
};

initializeCounter();

// Define the customer schema with `versionKey: false` to remove `__v`
const customerSchema = new mongoose.Schema({
    _id: Number,  // Custom incrementing ID field
    fullname: String,
    email: String,
    phoneno: Number,
    address: String,
    nic: String,
    age: Number
}, { versionKey: false });

// Model for the customer collection
const Customers = mongoose.model("customer", customerSchema, "customer");

// Function to get the next sequential ID
const getNextSequence = async (name) => {
    const counter = await Counter.findOneAndUpdate(
        { name: name },
        { $inc: { seq: 1 } },
        { new: true }
    );
    return counter.seq;
};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/post', async (req, res) => {
    const { fullname, email, phoneno, address, nic, age } = req.body;

    // Get the next customer ID
    const customerId = await getNextSequence("customer_id");

    // Create a new customer with the custom ID
    const user = new Customers({
        _id: customerId,
        fullname,
        email,
        phoneno,
        address,
        nic,
        age
    });

    await user.save();
    console.log("Customer saved:", user);

    // Send HTML response with JavaScript alert
    res.send(`
        <script>
            alert("Registered successfully.");
            window.location.href = '/';
        </script>
    `);
});

app.listen(port, () => {
    console.log("Server started on port", port);
});
