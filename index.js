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
    const applicationCollection = client.db("visa-navigator").collection("application")

    

    app.post('/visaData', async (req, res) => {

        const data = req.body;
        
        const result = await visaCollection.insertOne(data)
        res.send(result)
      })

      app.get('/visaData',async(req,res)=>{    
        const result = await visaCollection.find().sort({ _id: -1 }).toArray()
        res.send(result)
      })
      app.get('/visaData/:id',async(req,res)=>{
        const id = req.params.id;
        const query={_id:new ObjectId(id)}
        const result = await visaCollection.findOne(query)
        res.send(result)
       
      })
      app.get('/visaDataSort', async (req, res) => {
          const result = await visaCollection.find().sort({ _id: -1 }).limit(6).toArray(); 
          res.send(result);
       
      });
      app.post('/visaApplications', async (req, res) => {

        const data = req.body;
        
        const result = await applicationCollection.insertOne(data)
        res.send(result)
      })
      app.get('/visaApplications',async(req,res)=>{

        const result = await applicationCollection.find().sort({ _id: -1 }).toArray()
        res.send(result)
      })

      app.get('/myVisaApplications', async (req, res) => {

        const { searchParams } = req.query;
        let option = {};
        if (searchParams) {
          option = { country: { $regex: searchParams, $options: "i" } };
        }
      
        try {
          const email = req.headers.authorization?.split(' ')[1];
          if (!email) {
            return res.status(400).send({ message: 'Email not provided' });
          }
      
          const query = {
            email: email,
            ...option,
          };
          const result = await applicationCollection.find(query).toArray();
          res.send(result);
        } catch (error) {
          res.status(500).send({ message: 'Server error', error });
        }
      });
      

      app.delete('/myVisaApplications/:id',async(req,res)=>{
        const id = req.params.id;
        const query={_id:new ObjectId(id)}
        const result = await applicationCollection.deleteOne(query)
        res.send(result)
       
      })

      app.get('/myAddedVisas', async (req, res) => {
        try {
          
          const email = req.headers.authorization?.split(' ')[1];
          
          if (!email) {
            return res.status(400).send({ message: 'Email not provided' });
          }
      
          const result = await visaCollection.find({authUserEmail: email }).toArray();
          
          if (!result || result.length === 0) {
            return res.status(404).send({ message: 'No visa data found' });
          }
      
          res.send(result);
        } catch (error) {
          res.status(500).send({ message: 'Server error', error });
        }
      });
      
      app.delete('/myAddedVisas/:id',async(req,res)=>{
        const id = req.params.id;
        const query={_id:new ObjectId(id)}
        const result = await visaCollection.deleteOne(query)
        res.send(result)
       
      })

    

      app.patch('/update/:id', async (req, res) => {
        const id = req.params.id;
        const data = req.body;
    
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ message: 'Invalid ID format' });
        }
    
        const query = { _id: new ObjectId(id) };
        const update = {
            $set: {
                name: data?.name,
                visaType: data?.visaType,
                processingTime: data?.processingTime,
                fee: data?.fee,
                validity: data?.validity,
                method: data?.method,
                image: data?.image,
            }
        };
    
        try {
            const result = await visaCollection.updateOne(query, update);
            res.send(result);
        } catch (error) {
            console.error('Error updating visa:', error);
            res.status(500).send({ message: 'Failed to update visa' });
        }
    });
     
app.get('/selectedVisa', async (req, res) => {
  const visaType = req.query.visaType;
  
  try {
    const result = await visaCollection.find({ visaType: visaType }).toArray();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching visas' });
  }
});

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