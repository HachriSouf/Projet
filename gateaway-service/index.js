const express = require("express");
const authRoutes = require("./routes/authRoutes");
const dotenv = require("dotenv");

const app = express();

dotenv.config();

app.use(express.json());

// Use authentication routes
app.use("/api", authRoutes);




const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Gateway running on port ${PORT}`));