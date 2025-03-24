const localStrategy = require("passport-local").Strategy
const db = require('../models/database')
const bcrypt = require("bcryptjs")
const User = require('../models/users')

module.exports = function(passport){
    passport.use(new localStrategy({usernameField: 'email', passwordField: "senha"}, 
        (email, senha, done) => {
            User.findOne({ where: { email: email } }) 
            .then((usuario) => {
                if(!usuario) return done(null, false, {message: "Esta conta não existe"});
                
                bcrypt.compare(senha, usuario.senha, (erro, batem) => {
                    if(erro) return done(erro);
                    batem ? done(null, usuario) : done(null, false, {message:"Senha incorreta"});
                });
            })
            .catch(err => done(err));
        }));

        passport.serializeUser((user, done) => {
            done(null, user.id);
        });
        
        passport.deserializeUser(async (id, done) => {
            try {
                const user = await User.findByPk(id);
                done(null, user);
            } catch (error) {
                done(error, null);
            }
        });
        module.exports = {
            ensureAuthenticated: (req, res, next) => {
                if (req.isAuthenticated()) {
                    return next();
                }
                req.flash('error_msg', 'Você precisa estar logado para acessar essa página.');
                res.redirect('/login');
            }
        };
        
}