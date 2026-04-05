require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
require('./models'); // Load models and associations

const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
    console.error('Missing JWT_SECRET in environment. Set it in backend/.env before starting the server.');
    process.exit(1);
}

// Connect to Database
connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
