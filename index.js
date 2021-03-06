const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mtojm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

async function run() {
  try {
    await client.connect();
    const database = client.db("travel_agency");
    const spotsCollection = database.collection("top-spots");
    const blogCollection = database.collection("blogs");
    const usersCollection = database.collection("users");

    // GET API
    app.get("/spots", async (req, res) => {
      const cursor = spotsCollection.find({});
      const spots = await cursor.toArray();
      res.send(spots);
    });

    //GET API BLOGS
    app.get("/blogs", async (req, res) => {
      const cursor = blogCollection.find({});
      const blog = await cursor.toArray();
      res.send(blog);
    });

    //GET SINGLE API Blogs
    app.get("/blogDetails/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const blog = await blogCollection.findOne(query);
      // console.log('load user with id: ', id);
      res.send(blog);
    });

    // POST BLOGS
    app.post("/blogs", async (req, res) => {
      const blog = req.body;
      blog.status = "pending";
      const result = await blogCollection.insertOne(blog);
      res.json(result);
    });

    // Delete from all blogs
    app.delete("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await blogCollection.deleteOne(query);
      res.send(result);
    });

    //  blog status update
    app.put("/updateStatus/:id", (req, res) => {
      const id = req.params.id;
      console.log(id);
      // const updatedStatus = req.body;
      const filter = { _id: ObjectId(id) }; //_id: ObjectId(6234545686846)
      //console.log(updatedStatus);           //_id: ObjectId(65595845466)
      blogCollection
        .updateOne(filter, {
          $set: { status: "Approved" },
        })
        .then((result) => {
          res.json(result);
        });

      console.log("updating", id);
    });

    // Add user
    app.post("/users", async (req, res) => {
      const data = await usersCollection.insertOne(req.body);
      res.send(data);
    });

    // Get user
    app.get("/users/:email", async (req, res) => {
      const data = await usersCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(data);
    });

    // Update new admin
    app.put("/users", async (req, res) => {
      const email = { email: req.body.email };
      const data = await usersCollection.find({ email });
      if (data) {
        const result = await usersCollection.updateOne(email, {
          $set: { role: "admin" },
        });
        res.send(result);
      } else {
        const result = await usersCollection.insertOne(req.body.email, {
          role: "admin",
        });
        res(result);
      }
    });

    // POST BLOG BY ADMIN
    app.post("/adminBlogs", async (req, res) => {
      const blog = req.body;
      const result = await blogCollection.insertOne(blog);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`server is running at http://localhost:${port}`);
});
