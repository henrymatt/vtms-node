'use strict';
let db = require('../config/sequelize.js'),
    Sequelize = require('sequelize');

let models = {};

models.Sequelize = Sequelize;

models.Series = require('./Series.js');
models.LanguageSeries = require('./LanguageSeries.js');
models.Lesson = require('./Lesson.js');
models.Language = require('./Language.js');
models.Level = require('./Level.js');
models.Shot = require('./Shot.js');
models.User = require('./User.js');
models.Shift = require('./Shift.js');
models.Activity = require('./Activity.js');
models.Channel = require('./Channel.js');
models.Talent = require('./Talent.js');
models.Task = require('./Task.js');
models.Issue = require('./Issue.js');
models.TaskGlobal = require('./TaskGlobal.js');
models.TeamMember = require('./TeamMember.js');
models.PublishDate = require('./PublishDate.js');
models.Platform = require('./Platform.js');

models.Series.hasMany(models.LanguageSeries, { foreignKey: 'fkSeries' } );
models.Series.hasMany(models.TaskGlobal, { foreignKey: 'fkSeries' } );

models.LanguageSeries.belongsTo(models.Series, { foreignKey: 'fkSeries' } );
models.LanguageSeries.belongsTo(models.Language, { foreignKey: 'fkLanguage' } );
models.LanguageSeries.belongsTo(models.Level, { foreignKey: 'fkLevel' } );
models.LanguageSeries.belongsTo(models.Talent, { foreignKey: 'fkTalent' } );
models.LanguageSeries.belongsTo(models.Channel, { foreignKey: 'fkChannel'} );
models.LanguageSeries.hasMany(models.Lesson, { foreignKey: 'fkLanguageSeries' } );

models.Lesson.belongsTo(models.LanguageSeries, { foreignKey: 'fkLanguageSeries'} );
models.Lesson.hasMany(models.Shot, { foreignKey: 'fkLesson' } );
models.Lesson.hasMany(models.Task, { foreignKey: 'fkLesson' } );
models.Lesson.hasMany(models.PublishDate, {foreignKey: 'fkLesson'} );
models.Lesson.hasMany(models.Issue, {foreignKey: 'fkLesson'} );
models.Lesson.belongsTo(models.Task, { as: 'lastTask', foreignKey: 'fkLastTask'} );
models.Lesson.belongsTo(models.Issue, { as: 'lastIssue', foreignKey: 'fkLastIssue'} );

models.Language.hasMany(models.LanguageSeries, { foreignKey: 'fkLanguage' } );

models.Level.hasMany(models.LanguageSeries, { foreignKey: 'fkLevel' } );

models.Shot.belongsTo(models.Lesson, { foreignKey: 'fkLesson' } );
models.Shot.belongsTo(models.Talent, { foreignKey: 'fkTalent' } );

models.User.belongsTo(models.TeamMember, { foreignKey: 'fkTeamMember' } );

models.Shift.hasMany(models.Activity, { foreignKey: 'fkShift' } );
models.Shift.belongsTo(models.TeamMember, { foreignKey: 'fkTeamMember' } );

models.Activity.belongsTo(models.Shift, { foreignKey: 'fkShift' } );
models.Activity.belongsTo(models.Task, { foreignKey: 'fkTask'} );
models.Activity.belongsTo(models.TeamMember, { foreignKey: 'fkTeamMember'} );
models.Activity.hasMany(models.Issue, { foreignKey: 'fkActivity' } );
// Activity Foreign Keys may need to be modeled differently

models.Channel.hasMany(models.LanguageSeries, { foreignKey: 'fkChannel' } );

models.Talent.hasMany(models.Shot, { foreignKey: 'fkTalent' } );

models.Task.belongsTo(models.TaskGlobal, { foreignKey: 'fkTaskGlobal' } );
models.Task.belongsTo(models.Lesson, { foreignKey: 'fkLesson' } );
models.Task.belongsTo(models.TeamMember, { foreignKey: 'fkTeamMember' } );
models.Task.hasMany(models.Activity, { foreignKey: 'fkTask' } );
models.Task.hasMany(models.Issue, { foreignKey: 'fkTask' } );

models.Issue.belongsTo(models.Task, { foreignKey: 'fkTask' } );
models.Issue.belongsTo(models.Lesson, { foreignKey: 'fkLesson' } );
models.Issue.belongsTo(models.Activity, { foreignKey: 'fkActivity' } );

models.TaskGlobal.hasMany(models.Task, { foreignKey: 'fkTaskGlobal' } );
models.TaskGlobal.belongsTo(models.Series, { foreignKey: 'fkSeries' } );

//models.TeamMember.hasMany(models.User, { foreignKey: 'fkTeamMember' } );
models.TeamMember.hasMany(models.Shift, { foreignKey: 'fkTeamMember' } );
models.TeamMember.hasMany(models.Task, { foreignKey: 'fkTeamMember' } );
models.TeamMember.hasMany(models.Activity, { foreignKey: 'fkTeamMember'} );

models.PublishDate.belongsTo(models.Lesson, { foreignKey: 'fkLesson'} );
models.PublishDate.belongsTo(models.Platform, { foreignKey: 'fkPlatform'} );

models.Platform.hasMany(models.PublishDate, { foreignKey: 'fkPlatform'} );

module.exports = models;
