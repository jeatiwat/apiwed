import express from "express";

import { conn, queryAsync } from "../dbconnect";

import { databasePostRequest } from "../model/data_post";

import mysql from "mysql";
import { votesPostRequest } from "../model/votes_post";

export const router = express.Router();
const bcrypt = require('bcryptjs');


router.post("/", (req, res) => {
    let apply: databasePostRequest = req.body;
    let sql =
      "INSERT INTO `user`(`username`, `password`,`name`, `type`, `profile`) VALUES (?,?,?,?,?)";
    sql = mysql.format(sql, [
      
      apply.username,
      apply.password,
      apply.name,
      apply.type,
      apply.profile,
    ]);
    conn.query(sql, (err, result) => {
      if (err) throw err;
      res
        .status(201)
        .json({ affected_row: result.affectedRows, last_idx: result.insertId });
    });
  });
  router.delete("/:id", (req, res) => {
    let id = +req.params.id;
    conn.query("delete from user where uid = ?", [id], (err, result) => {
       if (err) throw err;
       res
         .status(200)
         .json({ affected_row: result.affectedRows });
    });
  });



  router.get("/", (req, res) => {
    const id1Query = "SELECT uid,pid FROM user_picture ORDER BY RAND() LIMIT 1;";
    conn.query(id1Query, (error, results1) => {
        if (error) throw error;

        const pid1 = results1[0].pid;
        const uid1 = results1[0].uid;

        const id2Query = `SELECT uid,pid FROM user_picture WHERE uid != ${uid1} ORDER BY RAND() LIMIT 1;`;

        conn.query(id2Query, (error, results2) => {
            if (error) throw error;

            const pid2 = results2[0].pid;

            const sql1 = "SELECT picture.* FROM picture  WHERE picture.pid = ?;";
            const sql2 = "SELECT picture.* FROM picture  WHERE picture.pid = ?;";

            conn.query(sql1, [pid1], (error, user1) => {
                if (error) throw error;

                conn.query(sql2, [pid2], (error, user2) => {
                    if (error) throw error;

                    res.json({ user1: user1, user2: user2 });
                });
            });
        });
    });
});


  router.get("/:id", (req, res)=>{
    const id = req.params.id; //params ย่อมาจาก พารามิเตอร์
    
    // res.send('Methon GET in trip.ts : ' + id);
    const sql = "select * from user where uid = ? ";

    conn.query(sql,[id],(err,result)=>{
        if(err){ //check error
            res.status(400).json(err);
        }else{
            res.json(result);
        }
    })
});



  router.get("/:username/:password", (req, res) => {
    const username = req.params.username;
    const password = req.params.password;

    conn.query('SELECT * FROM user WHERE username = ?', [username], async (err, result, fields) => {
        if (err) {
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        if (result.length === 0) {
            res.status(400).json({ error: 'User not found.' });
            return;
        }
        const user = result[0];
        try {
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                // If passwords match, return user data
                res.json(user);
            } else {
                // If passwords don't match, return error
                res.status(400).json({ error: 'Incorrect password.' });
            }
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
});


  
  
  router.put("/:id", async (req, res) => {
    let id = +req.params.id;
    let operations: databasePostRequest = req.body;
    let dataOriginal: databasePostRequest | undefined;
  
    let sql = mysql.format("select * from user where uid = ?", [id]);
  
    let result = await queryAsync(sql);
    const rawData = JSON.parse(JSON.stringify(result));
    console.log(rawData);
    dataOriginal = rawData[0] as databasePostRequest;
    console.log(dataOriginal);
  
    let updatedData = {...dataOriginal, ...operations};
    console.log(operations);
    console.log(updatedData);
      sql =
        "update  `user` set `username`=?, `password`=?, `name`=?, `type`=?, `profile`=? where `uid`=?";
      sql = mysql.format(sql, [
        updatedData.username,
        updatedData.password,
        updatedData.name,
        updatedData.type,
        updatedData.profile,
        id,
      ]);
      conn.query(sql, (err, result) => {
        if (err) throw err;
        res.status(201).json({ affected_row: result.affectedRows });
      });
  });

router.put("/:pid1/:pid2", async (req, res) => {
  let id1 = +req.params.pid1;
  let id2 = +req.params.pid2;

  let { vid1, vid2 } = req.body; // รับค่า vid1 และ vid2 จาก req.body

  let currentDate = new Date(); // สร้างวันที่และเวลาปัจจุบัน
  let formattedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  // ตรวจสอบว่ามี vote ในวันที่เดียวกันหรือไม่
  let checkVoteSql1 = `
    SELECT COUNT(*) AS vote_count
    FROM votes
    WHERE DATE(date) = DATE(?) AND pid = ?`;

  let checkVoteSql2 = `
    SELECT COUNT(*) AS vote_count
    FROM votes
    WHERE DATE(date) = DATE(?) AND pid = ?`;

  conn.query(checkVoteSql1, [formattedDate, id1], (err, voteCountResult1) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    conn.query(checkVoteSql2, [formattedDate, id2], (err, voteCountResult2) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }

      if (voteCountResult1[0].vote_count > 0) {
        // ถ้ามี vote ในวันที่เดียวกันแล้วสำหรับ pid1
        let updateSql1 = `
          UPDATE votes
          SET vote = ? 
          WHERE pid = ? AND DATE(date) = DATE(?)`;

        conn.query(updateSql1, [vid1.vote, id1, formattedDate], (err, result1) => {
          if (err) {
            console.error("Error:", err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
          }

          // เมื่ออัปเดต vote สำหรับ pid1 เรียบร้อยแล้ว ตรวจสอบ pid2
          if (voteCountResult2[0].vote_count > 0) {
            // ถ้ามี vote ในวันที่เดียวกันแล้วสำหรับ pid2 ให้ทำการอัปเดต vote สำหรับ pid2
            let updateSql2 = `
              UPDATE votes
              SET vote = ? 
              WHERE pid = ? AND DATE(date) = DATE(?)`;

            conn.query(updateSql2, [vid2.vote, id2, formattedDate], (err, result2) => {
              if (err) {
                console.error("Error:", err);
                res.status(500).json({ error: "Internal Server Error" });
                return;
              }

              // Update picture.point for pid1
              let updatePointSql1 = `
                UPDATE picture
                SET point = (SELECT vote FROM votes WHERE pid = ? ORDER BY date DESC LIMIT 1)
                WHERE pid = ?`;

              conn.query(updatePointSql1, [id1, id1], (err, result3) => {
                if (err) {
                  console.error("Error:", err);
                  res.status(500).json({ error: "Internal Server Error" });
                  return;
                }

                // Update picture.point for pid2
                let updatePointSql2 = `
                  UPDATE picture
                  SET point = (SELECT vote FROM votes WHERE pid = ? ORDER BY date DESC LIMIT 1)
                  WHERE pid = ?`;

                conn.query(updatePointSql2, [id2, id2], (err, result4) => {
                  if (err) {
                    console.error("Error:", err);
                    res.status(500).json({ error: "Internal Server Error" });
                    return;
                  }

                  res.status(201).json({
                    updated_vote_rows_vid1: result1.affectedRows,
                    updated_vote_rows_vid2: result2.affectedRows,
                    updated_point_rows_vid1: result3.affectedRows,
                    updated_point_rows_vid2: result4.affectedRows
                  });
                });
              });
            });
          } else {
            // ถ้ายังไม่มี vote ในวันที่เดียวกันสำหรับ pid2
            let insertSql2 = mysql.format("INSERT INTO `votes` (`vote`, `date`, `pid`) VALUES (?, ?, ?)", [vid2.vote, formattedDate, id2]);

            conn.query(insertSql2, (err, result2) => {
              if (err) {
                console.error("Error:", err);
                res.status(500).json({ error: "Internal Server Error" });
                return;
              }

              // Update picture.point for pid1
              let updatePointSql1 = `
                UPDATE picture
                SET point = (SELECT vote FROM votes WHERE pid = ? ORDER BY date DESC LIMIT 1)
                WHERE pid = ?`;

              conn.query(updatePointSql1, [id1, id1], (err, result3) => {
                if (err) {
                  console.error("Error:", err);
                  res.status(500).json({ error: "Internal Server Error" });
                  return;
                }

                // Update picture.point for pid2
                let updatePointSql2 = `
                  UPDATE picture
                  SET point = (SELECT vote FROM votes WHERE pid = ? ORDER BY date DESC LIMIT 1)
                  WHERE pid = ?`;

                conn.query(updatePointSql2, [id2, id2], (err, result4) => {
                  if (err) {
                    console.error("Error:", err);
                    res.status(500).json({ error: "Internal Server Error" });
                    return;
                  }

                  res.status(201).json({
                    updated_vote_rows_vid1: result1.affectedRows,
                    inserted_new_vote_vid2: result2.affectedRows,
                    updated_point_rows_vid1: result3.affectedRows,
                    updated_point_rows_vid2: result4.affectedRows,
                    inserted_new_votes: 1 // ทำการ insert vote ใหม่สำหรับ pid2
                  });
                });
              });
            });
          }
        });
      } else {
        // ถ้ายังไม่มี vote ในวันที่เดียวกันสำหรับ pid1
        let insertSql1 = mysql.format("INSERT INTO `votes` (`vote`, `date`, `pid`) VALUES (?, ?, ?)", [vid1.vote, formattedDate, id1]);

        conn.query(insertSql1, (err, result1) => {
          if (err) {
            console.error("Error:", err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
          }

          // เมื่อเพิ่ม vote สำหรับ pid1 เรียบร้อยแล้ว ตรวจสอบ pid2
          if (voteCountResult2[0].vote_count > 0) {
            // ถ้ามี vote ในวันที่เดียวกันสำหรับ pid2 ให้ทำการอัปเดต vote สำหรับ pid2
            let updateSql2 = `
              UPDATE votes
              SET vote = ? 
              WHERE pid = ? AND DATE(date) = DATE(?)`;

            conn.query(updateSql2, [vid2.vote, id2, formattedDate], (err, result2) => {
              if (err) {
                console.error("Error:", err);
                res.status(500).json({ error: "Internal Server Error" });
                return;
              }

              // Update picture.point for pid1
              let updatePointSql1 = `
                UPDATE picture
                SET point = (SELECT vote FROM votes WHERE pid = ? ORDER BY date DESC LIMIT 1)
                WHERE pid = ?`;

              conn.query(updatePointSql1, [id1, id1], (err, result3) => {
                if (err) {
                  console.error("Error:", err);
                  res.status(500).json({ error: "Internal Server Error" });
                  return;
                }

                // Update picture.point for pid2
                let updatePointSql2 = `
                  UPDATE picture
                  SET point = (SELECT vote FROM votes WHERE pid = ? ORDER BY date DESC LIMIT 1)
                  WHERE pid = ?`;

                conn.query(updatePointSql2, [id2, id2], (err, result4) => {
                  if (err) {
                    console.error("Error:", err);
                    res.status(500).json({ error: "Internal Server Error" });
                    return;
                  }

                  res.status(201).json({
                    inserted_new_vote_vid1: result1.affectedRows,
                    updated_vote_rows_vid2: result2.affectedRows,
                    updated_point_rows_vid1: result3.affectedRows,
                    updated_point_rows_vid2: result4.affectedRows,
                    inserted_new_votes: 1 // ทำการ insert vote ใหม่สำหรับ pid1
                  });
                });
              });
            });
          } else {
            // ถ้ายังไม่มี vote ในวันที่เดียวกันสำหรับ pid2
            let insertSql2 = mysql.format("INSERT INTO `votes` (`vote`, `date`, `pid`) VALUES (?, ?, ?)", [vid2.vote, formattedDate, id2]);

            conn.query(insertSql2, (err, result2) => {
              if (err) {
                console.error("Error:", err);
                res.status(500).json({ error: "Internal Server Error" });
                return;
              }

              // Update picture.point for pid1
              let updatePointSql1 = `
                UPDATE picture
                SET point = (SELECT vote FROM votes WHERE pid = ? ORDER BY date DESC LIMIT 1)
                WHERE pid = ?`;

              conn.query(updatePointSql1, [id1, id1], (err, result3) => {
                if (err) {
                  console.error("Error:", err);
                  res.status(500).json({ error: "Internal Server Error" });
                  return;
                }

                // Update picture.point for pid2
                let updatePointSql2 = `
                  UPDATE picture
                  SET point = (SELECT vote FROM votes WHERE pid = ? ORDER BY date DESC LIMIT 1)
                  WHERE pid = ?`;

                conn.query(updatePointSql2, [id2, id2], (err, result4) => {
                  if (err) {
                    console.error("Error:", err);
                    res.status(500).json({ error: "Internal Server Error" });
                    return;
                  }

                  res.status(201).json({
                    inserted_new_vote_vid1: result1.affectedRows,
                    inserted_new_vote_vid2: result2.affectedRows,
                    updated_point_rows_vid1: result3.affectedRows,
                    updated_point_rows_vid2: result4.affectedRows,
                    inserted_new_votes: 2 // ทำการ insert vote ใหม่สำหรับ pid1 และ pid2
                  });
                });
              });
            });
          }
        });
      }
    });
  });
});

  // router.post("/", (req, res) => {
  //   let body = req.body; 
  //   // res.send("Get in trip.ts body: " + body);
  //   res
  //     .status(201)
  //   // res.send("Get in trip.ts body : " + JSON.stringify(body));
  //     .json({ text : "Get in trip.ts body: "+ JSON.stringify(body)});
  // });


