require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
//model 
const Login = require('../models/model-Login');
// Porta que minha aplicação vai rodar 
const port = 3000;
const app = express();
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.status(200).send({ msg: 'Tudo Certo !!' })
});

// Registrar login
app.post('/newLogin', async (req, res) => {

    const { email, password } = req.body

    // Validações 

    if (!email || !password) {
        return res.status(422).send({ msg: 'Digite o Email e Senha!' });
    }

    // Check if Login exists 

    const loginExists = await Login.findOne({ email: email });
    if (loginExists) {
        return res.status(422).send({ msg: 'Este email já Existe, Ultilize outro!!' });
    }

    //crate password 

    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    //Create Login

    const newLogin = new Login({
        email,
        password: passwordHash
    })
    try {
        await newLogin.save()
        res.status(201).send({msg: 'Login Criado com Sucesso!!'});

    } catch (error) {
        res.status(500).send({ msg: 'Não foi possivel no momento, tente mais tarde' });
        console.log(error);
    }
});
// logar
app.post('/logar', async(req, res)=>{
    const {email, password} = req.body

    //Validações
    if (!email) {
        return res.status(422).send({ msg: 'Digite o Email !!' });
    }
    if (!password) {
        return res.status(422).send({ msg: 'Digite Sua Senha !!' });
    }

    // Check if Login exists 
    const logando = await Login.findOne({ email: email });
    if (!logando) {
        return res.status(404).send({ msg: 'Este email não esta registrado!!' });
    }
    // check se a Senha está correta
    const checkPass = await bcrypt.compare(password, logando.password);

    if(!checkPass){
        return res.status(422).send({ msg: 'Senha Inválida!!' });
    }
    try {
        const secret = process.env.SECRET

        const token = jwt.sign({
            id: logando._id
        },
        secret,
        )
        res.status(200).send({msg: 'Autenticação enviada com sucesso !!', token})

    } catch (error) {
        res.status(500).send({ msg: 'Não foi possivel no momento, tente mais tarde' });
        console.log(error);
    }


});


// Credenciais 
// const dbUser = process.dotenv.DB_USER
// const dbPassword = process.dotenv.DB_PASS
// console.log(dbUser);
// console.log(dbPassword);


mongoose
    .set('strictQuery', true)
    .connect(`mongodb+srv://Lucas:lucas2018@cluster0.pryykts.mongodb.net/?retryWrites=true&w=majority`)
    .then(() => {
        app.listen(port, () => {
            console.log(`Rodando na porta: http://localhost:${port}`)
        });
    })
    .catch((err) => console.log(err))

