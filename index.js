const express = require('express');
const Handlebars = require('handlebars');
const expressHandlebars = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
require('dotenv').config();
const bodyParser = require('body-parser');
const Hospital = require('./models/hospital');
const Reports =  require('./models/reports');
const Users = require('./models/users');
const session = require("express-session");
const flash = require("connect-flash");
const bcrypt = require("bcryptjs");
const passport = require('passport');
const { hash } = require('bcryptjs');
require("./config/auth")(passport)
const PORT = process.env.PORT || 3000;
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

//configure session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())
//middleware
app.use((req, res, next) =>{
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null;
    res.locals.isAuthenticated = req.isAuthenticated();
    next()
})

app.get('/api/key', (req, res) => {
    res.json({ key: process.env.MAPBOX_ACCESS_TOKEN });
});

// home
app.get('/', (req, res) => {
    res.render('home', {accessToken: process.env.MAPBOX_ACCESS_TOKEN});
});

//login e cadastrament

app.get('/login', (req, res) => {
    res.render('login');
})

app.get('/cadastro', (req, res)=> {
    res.render('cadastro');
})

//cadastramento users
app.post('/adduser', async (req, res) => {
    try {
        const { nome, sobrenome, email, senha, confirmacao } = req.body;

        // 1. Validação básica
        if (!nome || !sobrenome || !email || !senha) {
            return res.render('cadastro', { 
                error: "Todos os campos são obrigatórios!" 
            });
        }

        if (senha !== confirmacao) {
            return res.render('cadastro', { 
                error: "As senhas não coincidem!" 
            });
        }

        // 2. Verificar se usuário existe
        const usuarioExistente = await Users.findOne({ 
            where: { email: email } 
        });
        
        if (usuarioExistente) {
            return res.render('cadastro', { 
                error: "Este e-mail já está cadastrado!" 
            });
        }

        // 3. Hash da senha
        const saltRounds = 10;
        const hash = await bcrypt.hash(senha, saltRounds);

        // 4. Criar usuário
        await Users.create({
            nome: nome.trim(),
            sobrenome: sobrenome.trim(),
            nick: `${nome.trim()} ${sobrenome.trim()}`,
            email: email.toLowerCase().trim(),
            senha: hash
        });

        // 5. Redirecionar com mensagem
        req.flash('success_msg', 'Cadastro realizado com sucesso!');
        res.redirect('/login');

    } catch (error) {
        console.error('Erro no cadastro:', error);
        req.flash('error_msg', 'Erro interno no servidor');
        res.redirect('/cadastro');
    }
});

//login
app.post('/entrando', (req, res, next) => {
     passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true
     })(req, res, next)
})
// app.post('/entrando', (req, res) => {
//     const email = req.body.email
//     const senha = req.body.senha

//     Users.findOne({
//         where : {email : email,
//                 senha : senha}
//     }).then(function (user) {
//         if(user){
//         app.locals.Vnick = user.nick;
//         app.locals.status = true;
//         res.redirect('/')
//         }else{
//             res.render('login', {error: 'usuario e senha não encontrados!'})
//         }
//     }).catch(function(error){
//         res.render("erro "+ error)
//     })
// })
//logout
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Erro no logout:', err);
            return res.redirect('/');
        }
        req.flash('success_msg', 'Logout realizado com sucesso!');
        res.redirect('/');
    });
});
// app.get('/logout', (req, res) => {
//     app.locals.status = false;
//     app.locals.Vnick = null;
//     res.redirect('/')
// })

// Rota para detalhes do hospital
app.get('/detalhes', (req, res) => {
    const { name, idHosp, vicinity } = req.query;

    // Busca as informações no banco de dados onde o serial é igual ao idHosp (osm_id)
    Hospital.findAll({
        where: { serial: idHosp }, // Usa o osm_id como identificador
        order : [['createdAt', 'DESC']]
    }).then(function (hospitals) {
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

            return {
                ...hospital.dataValues,
                createdAtFormatted: formattedDate
            };
        });

        // Renderiza a página com os dados
        res.render('detalhes', { name, idHosp, vicinity, hospitals });
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
    const user = req.user; 
    let Dados = {
        serial: req.body.idHosp,
        avisos: req.body.aviso
    };
    if (req.isAuthenticated()) {
        Dados.nickUser = user.nick;
        Dados.iduser = user.id; // Armazene o ID do usuário
    }
    Hospital.create(Dados)
        .then(function () {
            res.redirect('back');
        })
        .catch(function (error) {
            res.send("houve um erro: " + error);
        });
});

// Enviar reports
app.post('/addrepo', function (req, res) {
    const user = req.user; 
    let Dados = {
        serial: req.body.idHosp,
        report: req.body.aviso,
        hospital : req.body.name
    };
    if (req.isAuthenticated()) {
        Dados.nickUser = user.nick;
        Dados.iduser = user.id; // Armazene o ID do usuário
    }
    Reports.create(Dados)
        .then(function () {
            req.flash('success_msg', 'Relatório enviado com sucesso!');
            res.redirect('back');
        })
        .catch(function (error) {
            req.flash('error', 'Erro ao enviar relatório: ' + error.message);
            res.redirect('back');
        });
});


// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
