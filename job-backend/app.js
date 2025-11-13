require('dotenv').config();
require("./appMongoose");
const express = require('express');
const cors = require('cors');
const app = express();
const userRouter = require('./route/userrouter');
const jobRouter = require('./route/jobrouter');
const dashboardRouter = require('./route/dashboardrouter');
const profileRouter = require('./route/profilerouter');
const categoryRouter = require('./route/categoryrouter');
const searchRouter = require('./route/searchrouter');
console.log("the first  update in the projec");
app.use(express.json());
app.use(cors());
app.use('/api/user', userRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/profile', profileRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/search', searchRouter);

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Job Tracking API Server is running!',
    version: '1.0.0',
  });
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Job Tracking Server is running on port ${PORT}`);
});
