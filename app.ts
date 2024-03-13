import express from "express";

import { router as trip } from "./api/trip";
import { router as operations } from "./api/operations";
import { router as  upload } from "./api/upload";
import { router as  pastVotes } from "./api/pastVotes";
import bodyParser from "body-parser";


import cors from "cors";


// export const app = express();
// app.use("/", (req, res) => {
//   res.send("Hello World!!!");
// }); //นี้คือ api 1 เส้น 

export const app = express();
app.use(
    cors({
      origin: "*",
    })
  );

app.use(bodyParser.text());
app.use(bodyParser.json());

app.use("/trip", trip);
app.use("/operations", operations);
app.use("/upload", upload);
app.use("/pastVotes", pastVotes);
app.use("/uploads", express.static("uploads"));
// app.use("/", (req, res) => {
//   res.send("Hello World!!!");
// });