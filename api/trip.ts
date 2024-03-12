import express from "express";
import { conn } from "../dbconnect";

export const router = express.Router();

router.get("/:id", (req, res) => {
  res.send("Get in trip.ts id: " + req.params.id);
});

router.post("/", (req, res) => {
  let body = req.body; 
  // res.send("Get in trip.ts body: " + body);
  res
    .status(201)
  // res.send("Get in trip.ts body : " + JSON.stringify(body));
    .json({ text : "Get in trip.ts body: "+ JSON.stringify(body)});
});

router.get("/", (req, res) => {
  conn.query('select * from user', (err, result, fields)=>{
    res.json(result);
  });
});