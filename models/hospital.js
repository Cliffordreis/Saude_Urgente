const { FORCE } = require('sequelize/lib/index-hints');
const db = require('./database');

const Hospital = db.sequelize.define('Hospital', {
    serial : {
        type: db.Sequelize.STRING(27)
    },
    avisos: {
        type: db.Sequelize.TEXT
    },
    nickUser : {
        type: db.Sequelize.STRING(60)
    }
})

module.exports = Hospital;

// Hospital.sync({force : true})
