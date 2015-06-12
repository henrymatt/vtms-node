var models = require('../models/models');

exports.getTeamMemberById = function(req, res) {
  console.log("Searching for a Team Member with ID of " + req.params.id);
  models.TeamMember.findOne({
    where: {id: req.params.id}
  }).then(function(teamMember) {
    if(teamMember) {
      res.send(teamMember);
    } else {
      res.status(404).send({error: "No team member found with that ID."});
    }
  }).catch(function(err) {
    res.status(500).send({error: err});
  });
};

exports.getTeamMembers = function(req, res) {
  models.TeamMember.findAll({
      where: {isActive: true}
    }).then(function(teamMembers) {
    if(teamMembers) {
      res.send(teamMembers);
    } else {
      res.status(404).send({error: "No team members found"});
    }
  });
};

exports.getActionableTasksForTeamMemberWithId = function(req, res) {
  models.Task.findAll({
    where: {
      isActive: false,
      isCompleted: false,
      fkTeamMember: req.params.id
           },
    include: [
      {model: models.Lesson, include: [models.LanguageSeries, {model: models.PublishDate, required: true}] }, 
      {model: models.TeamMember}, 
      {model: models.TaskGlobal}],
    order: [[models.Lesson, models.PublishDate, 'date', 'ASC']],
    limit: 50
  }).then(function(tasks) {
    if(tasks) {
      res.send({tasks: tasks});
    } else {
      res.status(404).send({error: "There are no actionable tasks."});
    }
  }).catch(function(err) {
    res.status(500).send({error: err})
  });
};
// Due date = lowest dueDate item - taskGlobal.completionValue
// Actionable = if(the sum of all the completed tasks' taskGlobal's completion value >= the )

exports.updateLesson = function(req, res) {
  models.Lesson.findById(req.body.id).then(function(lesson) {
    for(var key in req.query) {
      lesson[key] = req.query[key];
    }
    lesson.save()
      .then(function(lesson) {
        res.status(200);
        return res.send();
      })
      .catch(function(err) {
        res.status(400);
        return res.send({reason: err.toString()});
      });
  
  });
};