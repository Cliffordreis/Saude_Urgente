const express = require('express');
const Handlebars = require('handlebars');
const expressHandlebars = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const Hospital = require('./models/hospital');
const apikey = require('./key');

//template engine
const app = express();

app.engine('handlebars', expressHandlebars.engine({
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}));
app.set('view engine', 'handlebars');

// Configurar body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configurar arquivos estáticos
app.use(express.static('public'));

// Rota básica
app.get('/', (req, res) => {
    res.render('home', {apikey});
});

app.get('/testdb', (req, res) => {
    res.render('testdb');
});

app.post('/addtest', function (req, res) {
    res.send('test enviado!');
});

// Rota para detalhes do hospital
app.get('/detalhes', (req, res) => {
    const { name, idHosp, vicinity } = req.query;

    // Busca as informações no banco de dados onde o serial é igual ao idHosp
    Hospital.findAll({
        where: { serial: idHosp },
        order : [['createdAT', 'DESC']]
    }).then(function (hospitals) {
        // Formata as datas antes de renderizar a página
        hospitals = hospitals.map(hospital => {
            const formattedDate = hospital.createdAt.toLocaleString('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            // Adiciona a data formatada diretamente ao objeto hospital
            return {
                ...hospital.dataValues, // Pega todos os valores do hospital
                createdAtFormatted: formattedDate // Adiciona a data formatada
            };
        });

        // Renderiza a página com todos os dados de uma vez
        res.render('detalhes', { name, idHosp, vicinity, hospitals: hospitals });
    }).catch(function (error) {
        res.status(500).send("Erro ao buscar avisos: " + error);
    });
});

//rota para destruir avisos:
app.get('/delete/:id', (req, res) => {
    const id = req.params.id;

    // Busca o aviso pelo ID e deleta ele
    Hospital.destroy({
        where: { id: id }
    }).then(() => {
        // Redireciona de volta para a página de detalhes após deletar
        res.redirect('back'); // Volta para a página anterior
    }).catch((error) => {
        res.status(500).send("Erro ao deletar aviso: " + error);
    });
});


// Enviar avisos
app.post('/addInf', function (req, res) {
    Hospital.create({
        serial: req.body.idHosp,
        avisos: req.body.aviso
    }).then(function () {
        res.redirect('back');
    }).catch(function (error) {
        res.send("houve um erro: " + error);
    });
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
