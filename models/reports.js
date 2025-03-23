const db = require('./database');

const Reports = db.sequelize.define('Reports', {
    serial: {
        type: db.Sequelize.STRING(27)
    },
    hospital: {
        type: db.Sequelize.STRING(100)
    },
    report: {
        type: db.Sequelize.TEXT
    },
    nickUser: {
        type: db.Sequelize.STRING(60)
    },
    iduser: {
        type: db.Sequelize.INTEGER(10)
    }

});

// Sincroniza a tabela sem apagar os dados existentes
db.sequelize.sync({ alter: true })
    .then(() => {
        console.log("Tabela 'Reports' sincronizada com sucesso.");
    })
    .catch((error) => {
        console.error("Erro ao sincronizar tabela 'Reports':", error);
    });

module.exports = Reports;