import express from "express";
import multer from "multer";
import mysql from "mysql";
import { conn } from "../dbconnect";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export const router = express.Router();

// Initialize Firebase app and storage (assuming firebaseConfig is defined elsewhere)
const firebaseConfig = {
  apiKey: "AIzaSyBP4PaKHkyegg7BE1qKm1yacs84lfkSkWo",
  authDomain: "tripbooking-m.firebaseapp.com",
  projectId: "tripbooking-m",
  storageBucket: "tripbooking-m.appspot.com",
  messagingSenderId: "146173309950",
  appId: "1:146173309950:web:538b785a7cb424074206af",
  measurementId: "G-7FYR93MV7L"
};



// MySQL connection configuration
const dbConfig = {

  connectionLimit: 10,
  host: "202.28.34.197",
  user: "web66_65011212216",
  password: "65011212216@csmsu",
  database: "web66_65011212216"
};


initializeApp(firebaseConfig);
const storage = getStorage();

// MySQL connection configuration (assuming dbConfig is defined elsewhere)
const pool = mysql.createPool(dbConfig);

// File middleware for handling file uploads with size limit
class FileMiddleware {
  public readonly diskLoader = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 67108864 // 64 MByte
    }
  });
}

const fileUpload = new FileMiddleware();

// POST endpoint for uploading images
router.post("/:uid", fileUpload.diskLoader.single("file"), async (req, res) => {
  const uid = req.params.uid;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Generate a unique filename with timestamp and random number
    const filename = Date.now() + "-" + Math.round(Math.random() * 10000) + ".png"; // Adjust extension as needed

    // Create a reference to the image in Firebase Storage
    const storageRef = ref(storage, "/images/" + filename);

    // Upload the image to Firebase Storage
    const metadata = {
      contentType: req.file.mimetype
    };
    const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);

    // Get the downloadable URL for the uploaded image
    const url = await getDownloadURL(snapshot.ref);

    const sql1 = "INSERT INTO `picture` (`title`, `picture_url`, `point`) VALUES (?, ?, ?)";
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

// PUT endpoint for updating images (assuming implementation is needed)
// ... Implement logic to update image in Firebase Storage and database ...

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