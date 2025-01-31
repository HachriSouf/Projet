const express = require("express");
const dotenv = require("dotenv");

const authRoutes = require("./routes/authRoutes");
const custRoutes = require("./routes/custRoutes");
const gateRoutes = require("./routes/gateawayRoute");
const bettingRoutes = require("./routes/bettingRoutes");
const matchRoutes = require("./routes/matchRoutes");
const oddRoutes = require("./routes/oddRoutes");
const teamRoutes = require("./routes/teamRoute");
const bookmakerRoutes = require("./routes/bookmakerRoutes");
const paymentRoutes = require("./routes/payementRoutes");  


const app = express();

dotenv.config();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/customers", custRoutes);
app.use("/gateway", gateRoutes);
app.use("/bet", bettingRoutes);
app.use("/matches", matchRoutes);
app.use("/odds", oddRoutes);
app.use("/teams", teamRoutes);
app.use("/bookmaker", bookmakerRoutes); 
app.use("/payement",paymentRoutes);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Gateway running on port ${PORT}`));