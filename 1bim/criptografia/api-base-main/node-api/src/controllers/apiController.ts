import { Request, Response } from 'express';
import { User } from '../models/User';
import nodemailer, { SendMailOptions } from 'nodemailer';
import JWT from "jsonwebtoken"
const bcrypt = require('bcrypt');

export const ping = (req: Request, res: Response) => {
    console.log('Solicitacao de ping.');
    res.json({ pong: true });
}


export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.params;
    try {
        console.log(`Solicitacao de recuperacao de senha para o email: ${email}`);

        const hasUser = await User.findOne({ where: { email } });
        if (!hasUser) {
            console.log(`Usuario não encontrado para o email: ${email}`);
            return res.status(404).json({ error: 'Usuario nao encontrado' });
        }

        const randomPassword = Math.random().toString(36).slice(-8);

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);

        hasUser.password = hashedPassword;
        await hasUser.save();

        const transporter = nodemailer.createTransport({
            host: 'sandbox.smtp.mailtrap.io',
            port: 2525,
            auth: {
                user: 'e6d3c2676458f8',
                pass: '3e24f49067ba63',
            }
        });

        const mailOptions = {
            from: 'plesssauri@gmail.com',
            to: email,
            subject: 'Recuperacao de senha',
            text: `Nova senha: ${randomPassword}`,
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Erro ao enviar email: ', error);
                res.status(500).json({ message: 'Erro ao enviar email.' });
            } else {
                console.log('Email enviado: ', info.response);
                res.status(200).json({ message: 'Nova senha enviada por email.' });
            }
        })

    } catch (error) {
        console.error('Erro ao recuperar senha: ', error);
        res.status(500).json({ error: 'Erro interno no processamento de recuperacao de senha' });
    }
}

export const register = async (req: Request, res: Response) => {

    const { email, password, name, discipline } = req.body;

    if (email && password && name && discipline && !isValidEmail(email)) {

        try {
            let hasUser = await User.findOne({ where: { email } });
            if (!hasUser) {
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                let newUser = await User.create({
                    email, password: hashedPassword, name, discipline
                });
                res.status(201).json({ message: "Usuario cadastrado: ", newUser});
            } else {
                return res.json({ error: 'E-mail já existe.' });
            }
        } catch (error) {
            console.error('Erro ao cadastrar: ', error);
            res.status(500).json({ error: 'Erro ao processar registro.'});
        }

        
    } else {
        res.status(400).json({ error: "Atributo não fornecido."})
    }

    return res.json({ error: 'E-mail e/ou senha não enviados.' });;
}

export const login = async (req: Request, res: Response) => {
    if (req.body.email && req.body.password) {
        let email: string = req.body.email;
        let password: string = req.body.password;

        let user = await User.findOne({
            where: { email, password }
        });

        if (user) {
            res.json({ status: true });
            return;
        }
    }

    res.json({ status: false });
}

export const listEmail = async (req: Request, res: Response) => {
    let users = await User.findAll();
    let list: string[] = [];

    for (let i in users) {
        list.push(users[i].email);
    }

    res.json({ list });
}


export const listAll = async (req: Request, res: Response) => {
    try {
        console.log('Solicitacao de listar todos usuarios recebida.');
        let users = await User.findAll();
        res.json({ users });
    } catch (error) {
        console.error('Erro ao listar todos os usuarios: ', error);
        res.status(500).json({ error: 'Erro ao listar todos os usuarios.' });
    }
}


export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const user = await User.findByPk(id);

        if (user) {
            const deletedUserName = user.name; // Obtém o nome do usuário que será deletado

            user.destroy();
            await user.save(); // Salva as alterações do status



            res.status(200).json({ message: `Usuario ${deletedUserName} foi removido com sucesso.`, status: '200' });
        } else {
            res.status(404).json({ message: `Usuario com ID ${id} nao encontrado.`, status: '404' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Ocorreu um erro ao remover o usuario.', status: '500', error });
    }
}

export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const values = req.body;

    const isEmpty = Object.values(values).some((value) => value === null || value === '');

    if (isEmpty) {
        return res.status(400).json({ message: 'Os dados enviados estao incompletos.', status: '400' });
    }

    try {
        const user = await User.findOne({ where: { id } });

        if (!user) {
            return res.status(404).json({ message: 'Usuario nao encontrado.', status: '404' });
        }

        if(!isValidEmail(req.body.email)){
            await User.update(values, { where: { id } });

            const updatedUser = await User.findOne({ where: { id } });
            return res.status(200).json({ message: 'Usuario atualizado com sucesso.', status: '200', updatedUser });

        }


        return res.status(500).json({ message: 'Email invalido.', status: '500'});
    } catch (error) {
        console.error(error);

        return res.status(500).json({ message: 'Erro ao atualizar usuario.', status: '500', error });
    }
}

function isValidEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}