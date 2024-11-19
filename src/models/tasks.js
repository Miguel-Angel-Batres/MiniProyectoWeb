const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    name: {type:String,required:true},
    description: {type:String,required:true},
    enddate: {type:Date,required:true}, 
    priority: {type:String,required:true},
    projectId: {type:mongoose.Schema.Types.ObjectId, ref:'Project',required:true}, 
    assignedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
      }], 
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
