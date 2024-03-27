import express from "express";
import path from "path";
import multer from "multer";
import mysql from "mysql";
import { conn } from "../dbconnect";

import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable} from "firebase/storage"
export const router = express.Router();


const dbConfig = {

  connectionLimit: 10,
  host: "202.28.34.197",
  user: "web66_65011212216",
  password: "65011212216@csmsu",
  database: "web66_65011212216"
};


const firebaseConfig = {
  apiKey: "AIzaSyBWibpAwgLsYEgYDHjVuSognrQW2VCNbVI",
  authDomain: "projectwed-cc3fc.firebaseapp.com",
  projectId: "projectwed-cc3fc",
  storageBucket: "projectwed-cc3fc.appspot.com",
  messagingSenderId: "542332922077",
  appId: "1:542332922077:web:79b741f3c9265f8fde5334",
  measurementId: "G-HHF17SY421"
};
initializeApp(firebaseConfig);
const storage = getStorage();




class FileMiddleware {
  //attribute filename
  filename = "";
  //attribute diskLoader
  // สร้าง obj 
  public readonly diskLoader = multer({
      //storage = defile folder (disk)
    storage: multer.memoryStorage(),
    // limit 64 MB
    limits: {
      fileSize: 67108864, // 64 MByte
    },
  });
}
// /upload
const fileupload = new FileMiddleware();


router.post("/:uid", fileupload.diskLoader.single("file"), async (req, res) => {
  const uid = req.params.uid; // Get uid from route parameters

  // Check if the number of pids for the given uid is greater than or equal to 5
  conn.query("SELECT COUNT(pid) AS count FROM user_picture WHERE uid = ?", [uid], (err, result) => {
    if (err) {
      console.error("Error retrieving count of pids for uid:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    const count = result[0].count;
    if (count >= 5) {
      // If the number of pids is greater than or equal to 5, send an error response
      res.status(400).json({ error: "The maximum number of pictures for this user has been reached" });
      return;
    }

    // If the number of pids is less than 5, proceed with uploading the file
    const currentTime = new Date();
    
    // gennarate file name
    const filename = "-" + Math.round(Math.random() * 10000) + ".png";
    // กำหนดชื่อ file
    const storageRef = ref(storage, "/image/" + filename);
    const metadata = {
      contentType: req.file!.mimetype
    }
    // upload
    uploadBytesResumable(storageRef, req.file!.buffer, metadata)
      .then(async (snapshot) => {
        const url = await getDownloadURL(snapshot.ref);

        // Inserting data into MySQL
        const sql1 = "INSERT INTO `picture` (`title`, `picture_url`,`point`) VALUES (?, ?, ?)";
        const sql2 = "INSERT INTO `user_picture` (`uid`, `pid`) VALUES (?, ?)";
        // const sql3 = "INSERT INTO `votes` (`vote`,`date`,`pid`) VALUES (?, ?, ?)";

        // Insert into picture table
        conn.query(sql1, [req.body.title || '', url, 0], (err, result) => {
          if (err) {
            console.error("Error inserting data into 'picture' table:", err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
          }

          // Retrieve pid from picture table
          const pictureId = result.insertId;

          // Insert into user_picture table with uid and pid
          conn.query(sql2, [uid, pictureId], (err, result) => {
            if (err) {
              console.error("Error inserting data into 'user_picture' table:", err);
              res.status(500).json({ error: "Internal Server Error" });
              return;
            }

  
              res.status(200).json({ file: url });
            // });
          });
        });
      })
      .catch((error) => {
        console.error("Error uploading file to storage:", error);
        res.status(500).json({ error: "Internal Server Error" });
      });
  });
});

router.put("/:pid", fileupload.diskLoader.single("file"), async (req, res) => {
  try {
    const pid = req.params.pid; // Get pid from route parameters

    // Check if req.file exists
    if (!req.file) {
      throw new Error("No file uploaded");
    }

    // Generate file name
    const filename = Date.now() + "-" + Math.round(Math.random() * 10000) + ".png";
    
    // Set file name
    const storageRef = ref(storage, "/image/" + filename);
    const metadata = {
      contentType: req.file.mimetype
    };

    // Upload
    const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
    const url = await getDownloadURL(snapshot.ref);

    const sql1 = "UPDATE `picture` SET `picture_url` = ? WHERE `pid` = ?";
    
    // Update picture table
    conn.query(sql1, [url, pid], (err, result) => {
      if (err) {
        console.error("Error updating data in 'picture' table:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }

      res.status(200).json({ success: true, message: "File uploaded successfully" });
    });
  } catch (error) {
    console.error("Error uploading file to storage:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get("/:id", (req, res) => {
  const id = req.params.id; //params ย่อมาจาก พารามิเตอร์

  // res.send('Methon GET in trip.ts : ' + id);
  const sql = "SELECT user_picture.*, picture.picture_url FROM user_picture JOIN picture ON user_picture.pid = picture.pid WHERE user_picture.uid = ?";

  conn.query(sql, [id], (err, result) => {
    if (err) { //check error
      res.status(400).json(err);
    } else {
      res.json(result);
    }
  })
});
