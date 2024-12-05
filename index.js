const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;

// middleware
app.use(express.json())
app.use(cors())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zlou2.mongodb.net/visa-navigator?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const visaCollection = client.db("visa-navigator").collection("visaData")
    console.log(visaCollection);
    

    app.post('/visaData', async (req, res) => {

        const data = req.body;
        console.log(data);
        
        const result = await visaCollection.insertOne(data)
        res.send(result)
      })

      app.get('/visaData',async(req,res)=>{
        const result = await visaCollection.find().toArray()
        res.send(result)
      })
      app.get('/visaData/:id',async(req,res)=>{
        const id = req.params.id;
        const query={_id:new ObjectId(id)}
        const result = await visaCollection.findOne(query)
        res.send(result)
       
      })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/",(req,res)=>{
    res.send('Server is running')
})

app.listen(port,()=>{
    console.log(`Server is running on port : ${port}`);
    
})