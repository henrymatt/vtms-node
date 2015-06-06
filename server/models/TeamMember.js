var db = require('../config/sequelize.js'),
    Sequelize = require('sequelize');
  
var TeamMember = db.define('teamMember', {
  id: {
    type: Sequelize.INTEGER
  },
  nameFirst: {
    type: Sequelize.STRING
  },
  nameLast: {
    type: Sequelize.STRING
  }
}, {
  getterMethods: {
    nameFull: function(){ return this.nameFirst + " " + this.nameLast; }
  },
  timestamps: false,
  freezeTableName: true
});

module.exports = TeamMember;