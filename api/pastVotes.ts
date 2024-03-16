import express from "express";
import { conn, queryAsync } from "../dbconnect";

export const router = express.Router();


router.get("/:pid" , (req,res) => {
    let id = +req.params.pid;
    const sql = `SELECT *, DATE_FORMAT(date, '%Y-%m-%d') AS date
    FROM votes
    WHERE pid = ?
    ORDER BY date DESC
    LIMIT 7;`;

    conn.query(sql, [id], (err,result)=>{
      if(err){ //check error
          res.status(400).json(err);
      }else{
          res.json(result);
      }
  });
});

router.get("/" , (req,res) =>{

    const sql = `SELECT
    p.*,
    up.uid,
    u.name,
    v.vote,
    v.date,
    @rank1 := ROW_NUMBER() OVER(ORDER BY p.point DESC) AS ranking1,
    @rank2 := ROW_NUMBER() OVER(ORDER BY v.vote DESC) AS ranking2
    FROM
        picture p
    JOIN
        user_picture up ON up.pid = p.pid
    JOIN
        user u ON up.uid = u.uid
    JOIN
        votes v ON p.pid = v.pid
    WHERE
        (p.pid, v.date) IN (
            SELECT
                pid,
                MAX(DATE_SUB(date, INTERVAL 1 DAY))
            FROM
                votes
            GROUP BY
                pid
        )
    ORDER BY
        p.point DESC,
        v.vote DESC
        
    LIMIT
        10;;`

    conn.query(sql, (err,result)=>{
        if(err){ //check error
            res.status(400).json(err);
        }else{
            res.json(result);
        }
    });

});