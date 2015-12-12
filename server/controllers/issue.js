'use strict';
let models = require('../models/models');

let getList = function(req, res, query) {
  models.Issue.findAll(query).then(function(issues) {
    if(issues) {
      res.send(issues);
    } else {
      res.status(404).send({error: 'No issues were found.'});
    }
  }).catch(function(err) {
    res.status(500).send({error: err});
  });
};

let getOne = function(req, res, query) {
  models.Issue.findOne(query).then(function(issue) {
    if(issue) {
      res.send(issue);
    } else {
      res.status(404).send({error: 'No issue was found.'});
    }
  }).catch(function(err) {
    res.status(500).send({error: err});
  });
};

exports.createIssue = function (req, res, next) {
  var userData = req.body;
  models.Issue.create(userData).then(function(issue) {
    issue.dataValues.id = issue.null;
    return res.send(issue);
  }).catch(function(err) {
      res.status(400);
      return res.send({reason: err});
    });
};

exports.updateIssue = function (req, res) {
  models.Issue.update(req.query, {where: {id: req.params.id}})
  .then(function() {
    res.status(200);
    return res.send();
  })
  .catch(function (err) {
    res.status(400);
    return res.send({reason: err.toString()});
  });
};

exports.deleteIssue = function (req, res) {
  models.Issue.findById(req.params.id).then(function (issue) {
    issue.destroy().then(function() {
      res.status(200).end();
    });
  }).catch(function(err) {
    return res.render('error', {
      error: err,
      status: 500
    });
  });
};

exports.getIssues = function(req, res) {
  getList(req, res, {include: [models.Task]});
};

exports.getIssueById = function(req, res) {
  getOne(req, res, {where: {id: req.params.id}});
};

exports.getIssuesForLessonWithId = function(req, res) {
  getList(req, res, {
    include: [
      {
        model: models.Task,
        include: [models.TaskGlobal]
      }
    ],
    where: {fkLesson: req.params.id}
  });
};

exports.getUnassignedIssuesForLesson = function(req, res) {
  getList(req, res, {where: {fkLesson: req.params.id, fkTask: 0}});
};

exports.getLastIssueForLessonWithId = function(req, res) {
  models.Issue.findOne({
    where: {
      fkLesson: req.params.id,
      isCompleted: true
    },
    order: [['timeCompleted', 'desc']],
    limit: 1
  }).then(function(issue) {
    if(issue) {
      res.send(issue);
    } else {
      res.status(200).send({error: 'No issues were completed for this lesson.'});
    }
  }).catch(function(err) {
    res.status(500).send({error: err});
  });
};

exports.getIssuesForTeamMember = function(req, res) {
  getList(req, res, {
    include: [
      {
        model: models.Task,
        where: {fkTeamMember: req.params.id},
        include: [models.TaskGlobal, {model: models.Lesson, include: [models.LanguageSeries]}]
      }
    ],
    where: {isCompleted: false}
  });
};

exports.getIssuesForTask = function(req, res) {
  getList(req, res, {
    where: {fkTask: req.params.id, isCompleted: false}
  });
};
