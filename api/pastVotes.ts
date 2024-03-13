import express from "express";
import { conn, queryAsync } from "../dbconnect";

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

router.get("/" , (req,res) =>{

    const sql = `SELECT picture.*, user.uid, user.name 
                        FROM picture
                        JOIN user_picture ON user_picture.pid = picture.pid 
                        JOIN user ON user_picture.uid = user.uid 
                        WHERE 1 
                        ORDER BY point DESC
                        LIMIT 10;`

    conn.query(sql, (err,result)=>{
        if(err){ //check error
            res.status(400).json(err);
        }else{
            res.json(result);
        }
    });

});