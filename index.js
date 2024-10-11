const express = require('express');
const Handlebars = require('handlebars');
const expressHandlebars = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const Hospital = require('./models/hospital');
const apikey = require('./key');
const Users = require('./models/users');
//template engine
const app = express();
app.locals.Vnick;
app.locals.status = false;

app.engine('handlebars', expressHandlebars.engine({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: {
        eq: function(a, b) {
            return a === b;
        }
    }
}));
app.set('view engine', 'handlebars');

// Configurar body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configurar arquivos estáticos
app.use(express.static('public'));

// home
app.get('/', (req, res) => {
    res.render('home', {apikey});
});

//login e cadastrament

app.get('/login', (req, res) => {
    res.render('login');
})

app.get('/cadastro', (req, res)=> {
    res.render('cadastro');
})

//cadastramento users
app.post('/adduser', function(req, res) {
    const {email, senha, confirmacao} = req.body
    if (senha !== confirmacao){
        return res.render('cadastro', {error: "as senhas não coincidem!"})
    }
    Users.findOne({
        where: {email : email}
    }).then(function(resultado){
        if(resultado){
        res.render('cadastro', {error: "esse email já possue registro no sistema!"})
        }else {
            Users.create({
                nome : req.body.nome,
                sobrenome : req.body.sobrenome,
                nick : req.body.nome + " " + req.body.sobrenome,
                email : req.body.email,
                senha: req.body.senha
            }).then(function (){
                res.redirect('/login')
            }).catch(function(error){
                res.send("houve um erro "+error)
            })
            }
    })
    
})

//login
app.post('/entrando', (req, res) => {
    const email = req.body.email
    const senha = req.body.senha

    Users.findOne({
        where : {email : email,
                senha : senha}
    }).then(function (user) {
        if(user){
        app.locals.Vnick = user.nick;
        app.locals.status = true;
        res.redirect('/')
        }else{
            res.render('login', {error: 'usuario e senha não encontrados!'})
        }
    }).catch(function(error){
        res.render("erro "+ error)
    })
})
//logout
app.get('/logout', (req, res) => {
    app.locals.status = false;
    app.locals.Vnick = null;
    res.redirect('/')
})

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
    let Dados = {
        serial: req.body.idHosp,
        avisos: req.body.aviso
    };
    if (app.locals.status) {
        Dados.nickUser = app.locals.Vnick;
    }
    Hospital.create(Dados)
        .then(function () {
            res.redirect('back');
        })
        .catch(function (error) {
            res.send("houve um erro: " + error);
        });
});


// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
