import { Router, Request, Response } from 'express';
import { FeedItem } from '../models/FeedItem';
import { NextFunction } from 'connect';
const { v4: uuidv4 } = require('uuid');
import * as jwt from 'jsonwebtoken';
import * as AWS from '../../../../aws';
import * as c from '../../../../config/config';

const router: Router = Router();

/* This method use to be in the user api but i moved it here now i am spliting the monolith into microservices*/
export function requireAuth(req: Request, res: Response, next: NextFunction) {

    let pid = uuidv4();

    console.log(new Date().toLocaleString() + `: ${pid} - processing authentication in feed-servie`);

    if (!req.headers || !req.headers.authorization){
        return res.status(401).send({ message: 'No authorization headers.' });
    }

    const token_bearer = req.headers.authorization.split(' ');
    if(token_bearer.length != 2){
        return res.status(401).send({ message: 'Malformed token.' });
    }
    
    const token = token_bearer[1];
    return jwt.verify(token, c.config.jwt.secret , (err, decoded) => {
      if (err) {
        return res.status(500).send({ auth: false, message: 'Failed to authenticate.' });
      }
      console.log(new Date().toLocaleString() + `: ${pid} - authentication successful in feed-servie`);
      return next();
    });
}

// Get all feed items
router.get('/', async (req: Request, res: Response) => {
    const items = await FeedItem.findAndCountAll({order: [['id', 'DESC']]});
    items.rows.map((item) => {
            if(item.url) {
                item.url = AWS.getGetSignedUrl(item.url);
            }
    });
    res.send(items);
});

//@TODO
//Add an endpoint to GET a specific resource by Primary Key
router.get( "/:id", async ( req: Request, res: Response ) => {

    // destruct our path params
    let { id } = req.params;

    // check to make sure the id is set
    if (!id) { 
      // respond with an error if not
      return res.status(400).send(`id is required`);
    }

    //More Sequalize qury  here:  https://stackabuse.com/using-sequelize-orm-with-nodejs-and-express/
    const result = await FeedItem.findAll({ where: { id } });

    if(result.length != 0){
        res.status(200).send(result);
    }else{
        res.status(404).send(`Not found!`);
    }
});

// update a specific resource
router.patch('/:id', 
    requireAuth, 
    async (req: Request, res: Response) => {
        //@TODO try it yourself
        //res.send(500).send("not implemented")

        let { id } = req.params;
        const caption = req.body.caption;
        const fileName = req.body.url;

        if (!id) { 
        return res.status(400).send(`id is required`);
        }

        if (!caption) {
        return res.status(400).send({ message: 'Caption is required or malformed' });
        }
        
        if (!fileName) {
        return res.status(400).send({ message: 'File url is required' });
        }

        const result = await FeedItem.findByPk(id).then(function(feedItem) {
            feedItem.update({
                caption: caption,
                url: fileName
            });
        });

        //for some reason i was getting a warning error, that the pathc does not return  any value, although it updates properly
        res.status(200).send(result);
});


// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName', 
    requireAuth, 
    async (req: Request, res: Response) => {
    let { fileName } = req.params;
    const url = AWS.getPutSignedUrl(fileName);
    res.status(201).send({url: url});
});

// Post meta data and the filename after a file is uploaded 
// NOTE the file name is they key name in the s3 bucket.
// body : {caption: string, fileName: string};
router.post('/', 
    requireAuth, 
    async (req: Request, res: Response) => {
    const caption = req.body.caption;
    const fileName = req.body.url;

    // check Caption is valid
    if (!caption) {
        return res.status(400).send({ message: 'Caption is required or malformed' });
    }

    // check Filename is valid
    if (!fileName) {
        return res.status(400).send({ message: 'File url is required' });
    }

    const item = await new FeedItem({
            caption: caption,
            url: fileName
    });

    const saved_item = await item.save();

    saved_item.url = AWS.getGetSignedUrl(saved_item.url);
    res.status(201).send(saved_item);
});

export const FeedRouter: Router = router;