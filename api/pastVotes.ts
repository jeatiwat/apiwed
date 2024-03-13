import express from "express";

import { conn, queryAsync } from "../dbconnect";

import { databasePostRequest } from "../model/data_post";

import mysql from "mysql";

export const router = express.Router();


router.get("/:pid" , (req,res) => {
    let id = +req.params.pid;
    const sql = "SELECT * FROM votes WHERE pid = ? ORDER BY date DESC;";

    conn.query(sql, [id], (err,result)=>{
      if(err){ //check error
          res.status(400).json(err);
      }else{
          res.json(result);
      }
  });
});