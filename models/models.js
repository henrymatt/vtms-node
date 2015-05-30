var db = require('./database.js'),
    Sequelize = require('sequelize');

var models = {};

models.Series = require('./series.js');
models.LanguageSeries = require('./languageSeries.js');
models.Lesson = require('./lesson.js');

models.Series.hasMany(models.LanguageSeries, { foreignKey: 'fkSeries' } );
models.LanguageSeries.belongsTo(models.Series, { foreignKey: 'fkSeries'} );
models.LanguageSeries.hasMany(models.Lesson, { foreignKey: 'fkLanguageSeries'} );
models.Lesson.belongsTo(models.LanguageSeries, { foreignKey: 'fkLanguageSeries'} );

module.exports = models;