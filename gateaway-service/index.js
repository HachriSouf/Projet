const express = require("express");
const authRoutes = require("./routes/authRoutes");
const custRoutes = require("./routes/custRoutes");
const gateRoutes = require("./routes/gateawayRoute");


const dotenv = require("dotenv");

const app = express();

dotenv.config();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/customers", custRoutes);
app.use("/api/gateway", gateRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Gateway running on port ${PORT}`));