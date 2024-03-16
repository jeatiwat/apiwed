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
LEFT JOIN
    votes v ON p.pid = v.pid
LEFT JOIN (
        SELECT
            pid,
            MAX(DATE_SUB(date, INTERVAL 1 DAY)) AS max_date
        FROM
            votes
        GROUP BY
            pid
    ) max_votes ON p.pid = max_votes.pid AND v.date = max_votes.max_date
WHERE
    max_votes.pid IS NULL OR v.date IS NOT NULL
ORDER BY
    IFNULL(v.vote, 0) DESC,
    IFNULL(p.point, 0) DESC
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