const mongoose = require('mongoose');
require('dotenv').config();
const StudentProfile = require('./models/StudentProfile');

console.log("Connect to:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected.");
    console.log("Schema paths:");
    Object.keys(StudentProfile.schema.paths).forEach(path => {
        console.log(`- ${path}: required=${StudentProfile.schema.paths[path].isRequired}`);
    });
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
