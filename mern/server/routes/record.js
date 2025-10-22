// ...existing code...
import express from "express";
import db from "../db/connection.js";
import { ObjectId } from "mongodb";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const collection = db.collection("price_history");
    const results = await collection.find({}).toArray();
    res.status(200).send(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching records");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const collection = db.collection("price_history");
    const query = { _id: new ObjectId(req.params.id) };
    const result = await collection.findOne(query);
    if (!result) return res.status(404).send("Not found");
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching record");
  }
});

router.post("/", async (req, res) => {
  try {
    const newDocument = {
      time: req.body.time ? new Date(req.body.time) : new Date(),
      to_currency: req.body.to_currency || "",
      from_currency: req.body.from_currency || "",
      sell_price: req.body.sell_price != null ? Number(req.body.sell_price) : null,
      buy_price: req.body.buy_price != null ? Number(req.body.buy_price) : null,
    };
    const collection = db.collection("price_history");
    const result = await collection.insertOne(newDocument);
    res.status(201).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding record");
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const updates = {
      $set: {},
    };
    if (req.body.time) updates.$set.time = new Date(req.body.time);
    if (req.body.to_currency !== undefined) updates.$set.to_currency = req.body.to_currency;
    if (req.body.from_currency !== undefined) updates.$set.from_currency = req.body.from_currency;
    if (req.body.sell_price !== undefined) updates.$set.sell_price = Number(req.body.sell_price);
    if (req.body.buy_price !== undefined) updates.$set.buy_price = Number(req.body.buy_price);

    const collection = await db.collection("price_history");
    const result = await collection.updateOne(query, updates);
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating record");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const collection = db.collection("price_history");
    const result = await collection.deleteOne(query);
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting record");
  }
});

export default router;
// ...existing code...