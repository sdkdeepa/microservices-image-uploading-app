import { Router, Request, Response } from 'express';

import { User } from '../models/User';

import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { NextFunction } from 'connect';
const { v4: uuidv4 } = require('uuid');

import * as EmailValidator from 'email-validator';
import { config } from '../../../../config/config'; //imported our config file. We used the jwt secret key value in that file

const router: Router = Router();

async function generatePassword(plainTextPassword: string): Promise<string> {
    //@TODO Use Bcrypt to Generated Salted Hashed Passwords
    //FYI: we do 'await' in an asyncFunction so that we run all the function line by line. 
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(plainTextPassword,salt);
    return hash;
}

async function comparePasswords(plainTextPassword: string, hash: string): Promise<boolean> {
    //@TODO Use Bcrypt to Compare your password to your Salted Hashed Password
    const compare = await bcrypt.compare(plainTextPassword, hash);
    return compare;
}

function generateJWT(user: User): string {
    //@TODO Use jwt to create a new JWT Payload containing
    return jwt.sign({user}, config.jwt.secret);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    //return next();
    //we basically uncommented the remaining lines of code in this method
     if (!req.headers || !req.headers.authorization){ //we pass the JWT token in the authorizatin header of our equest type
         return res.status(401).send({ message: 'No authorization headers.' });
     }
    

     //eg of a token bearer looks like 'Bearer dfbdfdfbdhfbvhdsjbvhjsdvb'. So we take the token afte the split
     const token_bearer = req.headers.authorization.split(' ');
     if(token_bearer.length != 2){ //if our token is not in the format we expect. eg having more than one spaces or jus one string with no spaces
         return res.status(401).send({ message: 'Malformed token.' });
     }
    
     const token = token_bearer[1]; //our token is the first item of the array when 0 indexed

     return jwt.verify(token, config.jwt.secret, (err, decoded) => { //we decrypt the token with our secret key so that our server can validate if it is a valid token
       if (err) {
         return res.status(500).send({ auth: false, message: 'Failed to authenticate.' });
       }
       //we receive the payload of the token within the 'decoded' parameter of that returend value. The decoded parameter will be passed to our calling method by using the 'next()' method. 'requreAuth' is a middleware method. This is how it works
       //The Middleware can make changes to the request and the response objects of the Express router function it being called in. In this case when the user want to post a feed or edit the feed they posted at feed.router.ts
       //https://expressjs.com/en/guide/writing-middleware.html
       return next();
     });
}

router.get('/verification', 
    requireAuth, 
    async (req: Request, res: Response) => {
        return res.status(200).send({ auth: true, message: 'Authenticated.' });
});

router.post('/login', async (req: Request, res: Response) => {
    let pid = uuidv4();
    const email = req.body.email;
    const password = req.body.password;

    console.log(new Date().toLocaleString() + `: ${pid} - User ${email} requested to login in`);

    // check email is valid
    if (!email || !EmailValidator.validate(email)) {
        return res.status(400).send({ auth: false, message: 'Email is required or malformed' });
    }

    // check email password valid
    if (!password) {
        return res.status(400).send({ auth: false, message: 'Password is required' });
    }

    const user = await User.findByPk(email);
    // check that user exists
    if(!user) {
        return res.status(401).send({ auth: false, message: 'Unauthorized' });
    }

    // check that the password matches
    const authValid = await comparePasswords(password, user.password_hash)

    if(!authValid) {
        return res.status(401).send({ auth: false, message: 'Unauthorized' });
    }

    // Generate JWT
    const jwt = generateJWT(user);

    console.log(new Date().toLocaleString() + `: ${pid} - User ${email} successfully logged in`);
    res.status(200).send({ auth: true, token: jwt, user: user.short()});
});

//register a new user
//If we trace back into index.router and finally back to server.ts the endpoint to register a user though POST request type will be api/v0/users/auth/
router.post('/', async (req: Request, res: Response) => {
    const email = req.body.email;
    const plainTextPassword = req.body.password;
    // check email is valid
    if (!email || !EmailValidator.validate(email)) {
        return res.status(400).send({ auth: false, message: 'Email is required or malformed' });
    }

    // check email password valid
    if (!plainTextPassword) {
        return res.status(400).send({ auth: false, message: 'Password is required' });
    }

    // find the user
    const user = await User.findByPk(email);
    // check that user doesnt exists
    if(user) {
        return res.status(422).send({ auth: false, message: 'User may already exist' });
    }

    const password_hash = await generatePassword(plainTextPassword);

    const newUser = await new User({
        email: email,
        password_hash: password_hash
    });

    let savedUser;
    try {
        savedUser = await newUser.save();
    } catch (e) {
        throw e;
    }

    // Generate JWT
    const jwt = generateJWT(savedUser); //generateJWT is a local function. Check at the beginnig of this file

    res.status(201).send({auth: true, token: jwt, user: savedUser.short()}); //we returned to the client that auth is true, the JWT, and the and the user information itslef as part of the payload
});

router.get('/', async (req: Request, res: Response) => {
    res.send('auth')
});

export const AuthRouter: Router = router;