import express from "express";

import { conn, queryAsync } from "../dbconnect";

import { databasePostRequest } from "../model/data_post";

import mysql from "mysql";

export const router = express.Router();

router.get("/", (req, res)=>{
     //params ย่อมาจาก พารามิเตอร์
    
    // res.send('Methon GET in trip.ts : ' + id);
    const sql = "select * from user JOIN user_picture ON user.uid = user_picture.uid  JOIN picture ON user_picture.pid = picture.pid";

    conn.query(sql,(err,result)=>{
        if(err){ //check error
            res.status(400).json(err);
        }else{
            res.json(result);
        }
    })
});
