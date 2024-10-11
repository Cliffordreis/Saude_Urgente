const { FORCE } = require('sequelize/lib/index-hints');
const db = require('./database');

const Users = db.sequelize.define('Users', {
    nome : {
        type: db.Sequelize.STRING(20)
    },
    sobrenome : {
        type: db.Sequelize.STRING(20)
    },
    nick : {
        type: db.Sequelize.STRING(60)
    },
    email: {
        type: db.Sequelize.STRING(50),
    },
    senha: {
        type: db.Sequelize.STRING(20)
    }
})

module.exports = Users;

// Users.sync({force : true})