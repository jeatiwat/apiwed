import express from "express";
import path from "path";
import multer from "multer";
import mysql from "mysql";
import { conn } from "../dbconnect";

import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable} from "firebase/storage"
export const router = express.Router();

// MySQL connection configuration
const dbConfig = {

  connectionLimit: 10,
  host: "202.28.34.197",
  user: "web66_65011212216",
  password: "65011212216@csmsu",
  database: "web66_65011212216"
};




const firebaseConfig = {
  apiKey: "AIzaSyBP4PaKHkyegg7BE1qKm1yacs84lfkSkWo",
  authDomain: "tripbooking-m.firebaseapp.com",
  projectId: "tripbooking-m",
  storageBucket: "tripbooking-m.appspot.com",
  messagingSenderId: "146173309950",
  appId: "1:146173309950:web:538b785a7cb424074206af",
  measurementId: "G-7FYR93MV7L"
};

initializeApp(firebaseConfig);
const storage = getStorage();



class FileMiddleware {
  filename = "";
  public readonly diskLoader = multer({
      storage: multer.memoryStorage(),
      limits: {
          fileSize: 67108864 
      }
  });
}
const fileupload = new FileMiddleware();


router.post("/:uid", fileupload.diskLoader.single("file"), async (req, res) => {
  try {
    const uid = req.params.uid; 

    // Check if user has reached maximum picture limit
    conn.query("SELECT COUNT(pid) AS count FROM user_picture WHERE uid = ?", [uid], async (err, result) => {
      if (err) {
        console.error("Error retrieving count of pids for uid:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      const count = result[0].count;
      if (count >= 5) {
        return res.status(400).json({ error: "The maximum number of pictures for this user has been reached" });
      }

      const filename = Math.round(Math.random() * 100000) + '.png';
      const storageRef = ref(storage, "/images/" + filename);
      const metadata = { contentType: req.file!.mimetype };

      // Upload file to Firebase Storage
      const snapshot = await uploadBytesResumable(storageRef, req.file!.buffer, metadata);
      const url = await getDownloadURL(snapshot.ref);

      // Insert data into MySQL
      const sql1 = "INSERT INTO `picture` (`title`, `picture_url`, `point`) VALUES (?, ?, ?)";
      const sql2 = "INSERT INTO `user_picture` (`uid`, `pid`) VALUES (?, ?)";

      // Insert into picture table
      conn.query(sql1, [req.body.title || '', url, 0], (err, result) => {
        if (err) {
          console.error("Error inserting data into 'picture' table:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        // Retrieve pid from picture table
        const pictureId = result.insertId;

        // Insert into user_picture table with uid and pid
        conn.query(sql2, [uid, pictureId], (err, result) => {
          if (err) {
            console.error("Error inserting data into 'user_picture' table:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          return res.status(200).json({ filename: filename, url: url });
        });
      });
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});



router.put("/:pid", fileupload.diskLoader.single("file"), async (req, res) => {
  try {
    const pid = req.params.pid; 

    if (!req.file) {
      throw new Error("No file uploaded");
    }

    // Generate file name
    const filename = Math.round(Math.random() * 100000) + '.png';
    const storageRef = ref(storage, "/images/" + filename);
    const metadata = { contentType: req.file!.mimetype };

    // Upload file to Firebase Storage
    const snapshot = await uploadBytesResumable(storageRef, req.file!.buffer, metadata);
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
