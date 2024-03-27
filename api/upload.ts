import express from "express";
import multer from "multer";
import mysql from "mysql";
import { conn } from "../dbconnect";
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "@firebase/storage";

const router = express.Router();

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBP4PaKHkyegg7BE1qKm1yacs84lfkSkWo",
  authDomain: "tripbooking-m.firebaseapp.com",
  projectId: "tripbooking-m",
  storageBucket: "tripbooking-m.appspot.com",
  messagingSenderId: "146173309950",
  appId: "1:146173309950:web:538b785a7cb424074206af",
  measurementId: "G-7FYR93MV7L"
};


const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

class FileMiddleware {
  public readonly diskLoader = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 67108864 // 64 MByte
    },
    fileFilter: (req, file, callback) => {
      const allowedMimes = ["image/jpeg", "image/png"];
      if (allowedMimes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new Error("Invalid file type. Only JPEG and PNG are allowed."));
      }
    }
  });
}

const fileUpload = new FileMiddleware();

// POST endpoint for uploading file
router.post("/:uid", fileUpload.diskLoader.single("file"), async (req, res) => {
  const uid = req.params.uid;

  // Check if the number of pids for the given uid is greater than or equal to 5
  conn.query("SELECT COUNT(pid) AS count FROM user_picture WHERE uid = ?", [uid], async (err, result) => {
    if (err) {
      console.error("Error retrieving count of pids for uid:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    const count = result[0].count;
    if (count >= 5) {
      return res.status(400).json({ error: "The maximum number of pictures for this user has been reached" });
    }

    // If the number of pids is less than 5, proceed with uploading the file
    try {
      const filename = Date.now() + "-" + Math.round(Math.random() * 10000) + ".png";
      const storageRef = ref(storage, "/image/" + filename);
      const metadata = {
        contentType: req.file!.mimetype
      };
      const snapshot = await uploadBytesResumable(storageRef, req.file!.buffer, metadata);
      const url = await getDownloadURL(snapshot.ref);

      const sql1 = "INSERT INTO `picture` (`title`, `picture_url`,`point`) VALUES (?, ?, ?)";
      const sql2 = "INSERT INTO `user_picture` (`uid`, `pid`) VALUES (?, ?)";

      conn.query(sql1, [req.body.title || '', url, 0], async (err, result) => {
        if (err) {
          console.error("Error inserting data into 'picture' table:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        const pictureId = result.insertId;

        conn.query(sql2, [uid, pictureId], (err, result) => {
          if (err) {
            console.error("Error inserting data into 'user_picture' table:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          return res.status(200).json({ file: url });
        });
      });
    } catch (error) {
      console.error("Error uploading file to storage:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
});

// PUT endpoint for updating file
router.put("/:pid", fileUpload.diskLoader.single("file"), async (req, res) => {
  try {
    const pid = req.params.pid;

    if (!req.file) {
      throw new Error("No file uploaded");
    }

    const filename = Date.now() + "-" + Math.round(Math.random() * 10000) + ".png";
    const storageRef = ref(storage, "/image/" + filename);
    const metadata = {
      contentType: req.file.mimetype
    };

    const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
    const url = await getDownloadURL(snapshot.ref);

    const sql1 = "UPDATE `picture` SET `picture_url` = ? WHERE `pid` = ?";

    conn.query(sql1, [url, pid], (err, result) => {
      if (err) {
        console.error("Error updating data in 'picture' table:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      return res.status(200).json({ success: true, message: "File uploaded successfully" });
    });
  } catch (error) {
    console.error("Error uploading file to storage:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET endpoint for fetching pictures by user id
router.get("/:id", (req, res) => {
  const id = req.params.id;

  const sql = "SELECT user_picture.*, picture.picture_url FROM user_picture JOIN picture ON user_picture.pid = picture.pid WHERE user_picture.uid = ?";

  conn.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.json(result);
    }
  });
});

export { router };