const mongoose = require('mongoose');

const assignedUserSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true } 
});

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  createdAt: { type: Date, required: true },
  creatorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedUsers: { type: [assignedUserSchema], required: true }, 
  image: { type: String, required: true }
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
