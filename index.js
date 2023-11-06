const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors())
app.use(express.json())
app.use(cookieParser())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fbi4wg4.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,

    }
});

// const verifyClient = async(req, res, next) => {
//     const token = req.cookies?.token;
//     console.log('client token', token);
//     if(!token){
//         return res.status(401).send({message: 'Unauthorised'})
//     }
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=> {
//         if(err){
//             return res.status(401).send({message: 'Unauthorised'})
//         }
//         req.user = decoded
//         next()
//     })

// }

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const database = client.db("BlogsBackend");
        const blogsCollection = database.collection("AllBLogs");
        const subscribersCollection = database.collection("AllSubscribe");
        const commentsCollection = database.collection("AllComments");
        // auth api
        // app.post('/jwt', async (req, res) => {
        //     const user = req.body;
        //     console.log(user);
        //     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        //         expiresIn: '1h'
        //     })
        //     console.log(token);
        //     res
        //     .cookie('token', token, {
        //         httpOnly: true,
        //         secure: false
        //     })
        //     .send({ message: 'success' })
        // })
        // app.post('/logout', async(req, res)=> {

        //     res.clearCookie('token', {maxAge: 0}).send({success: true})
        // })



        // blogs 
        app.get('/api/v1/latestblogs', async (req, res) => {
            const result = await blogsCollection.find().sort({
                post_date
                    : -1
            }).limit(6).toArray();

            res.send(result)
        })
        app.get('/api/v1/featuresblogs', async (req, res) => {
            const blogs = await blogsCollection.find().toArray();
            const sortedBlogs = blogs.sort((a, b) => b.long_description.length - a.long_description.length);
        
            const result = sortedBlogs.slice(0, 10);
        
            

            res.send(result)
        })
        app.get('/api/v1/allblogs', async (req, res) => {
            const result = await blogsCollection.find().toArray();

            res.send(result)
        })
        app.post('/api/v1/allblogs', async (req, res) => {
            const blog = req.body
            const result = await blogsCollection.insertOne(blog);

            res.send(result)
        })
        app.get('/api/v1/signleblog/:id', async (req, res) => {
            // const result = await blogsCollection.find().toArray();
            const id = req.params.id;
            const cursor = { _id: new ObjectId(id) }
            console.log(cursor);
            const result = await blogsCollection.findOne(cursor)
            res.send(result)

        })
        app.put('/api/v1/signleblog/:id', async (req, res) => {
            const blog = req.body;

            const id = req.params.id;
            const cursor = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedBlog = {
                $set: {
                    title: blog.title,
                    short_description: blog.short_description,
                    long_description: blog.long_description,
                    category: blog.category,
                    img: blog.img,
                    posterImg: blog.posterImg,
                    posterName: blog.posterName,
                    email: blog.email,
                    post_date: blog.post_date
                }

            }
            const result = await blogsCollection.updateOne(cursor, updatedBlog, options)
            res.send(result)
        })

        app.get('/api/v1/subscribers', async (req, res) => {
            const result = await subscribersCollection.find().toArray()
            res.send(result)
        })
        app.post('/api/v1/subscribers', async (req, res) => {
            const subscriber = req.body;
            const result = await subscribersCollection.insertOne(subscriber);
            res.send(result)
        })

        //    comments 
        app.get('/api/v1/comments', async (req, res) => {
            const result = await commentsCollection.find().toArray();
            res.send(result)
        })
        app.get('/api/v1/singeblogcomments', async (req, res) => {
            const id = req.query.id;
            const cursor = { blogId: (id) }
            console.log(cursor);
            console.log(id);
            const result = await commentsCollection.find(cursor).toArray();
            res.send(result)
        })

        app.post('/api/v1/comments', async (req, res) => {
            const comment = req.body;
            const result = await commentsCollection.insertOne(comment);
            res.send(result)
        })



        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})