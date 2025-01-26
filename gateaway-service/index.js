const express = require("express");
const authRoutes = require("./routes/authRoutes");
const dotenv = require("dotenv");
const paymentRoutes = require("./routes/paymentRoutes");  


const app = express();

dotenv.config();

app.use(express.json());

app.use("/api", authRoutes);
app.use("/apii", paymentRoutes);  

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Gateway running on port ${PORT}`));