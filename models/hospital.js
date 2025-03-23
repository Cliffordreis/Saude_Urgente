const db = require('./database');

const Hospital = db.sequelize.define('Hospital', {
    serial: {
        type: db.Sequelize.STRING(27)
    },
    avisos: {
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
        console.log("Tabela 'Hospital' sincronizada com sucesso.");
    })
    .catch((error) => {
        console.error("Erro ao sincronizar tabela 'Hospital':", error);
    });

module.exports = Hospital;