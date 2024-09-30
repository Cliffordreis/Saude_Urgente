const { FORCE } = require('sequelize/lib/index-hints');
const db = require('./database');

const testp = db.sequelize.define('test', {
    id : {
        primaryKey : true,
        type: db.Sequelize.INTEGER
    },
    coment: {
        type: db.Sequelize.TEXT
    }
})

// testp.sync({force : true})
