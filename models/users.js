const db = require('./database');

const Users = db.sequelize.define('Users', {
    nome: {
        type: db.Sequelize.STRING(20)
    },
    sobrenome: {
        type: db.Sequelize.STRING(20)
    },
    nick: {
        type: db.Sequelize.STRING(60)
    },
    email: {
        type: db.Sequelize.STRING(50)
    },
    senha: {
        type: db.Sequelize.STRING(100)
    }
});

// Sincroniza a tabela 'Users' sem apagar dados existentes
db.sequelize.sync({ alter: true })
    .then(() => {
        console.log("Tabela 'Users' sincronizada com sucesso.");
    })
    .catch((error) => {
        console.error("Erro ao sincronizar tabela 'Users':", error);
    });

module.exports = Users;
