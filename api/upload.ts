import express from "express";
import path from "path";
import multer from "multer";
import { conn } from "../dbconnect";
export const router = express.Router();
import mysql from "mysql";

import { Request, Response } from "express"; // Import Express types if not already imported

router.get("/",(req,res)=>{
    res.send("Upload");
});


import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL,deleteObject } from "firebase/storage";

// Initialize Firebase app and storage
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
// Create a MySQL pool
const pool = mysql.createPool(dbConfig);

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


//add
router.post("/", fileupload.diskLoader.single("file"), async (req, res) => {
    const filename = Math.round(Math.random() * 100000) + '.png';
    const storageRef = ref(storage, "/images/" + filename);
    const metadata = { contentType: req.file!.mimetype };
    const snapshot = await uploadBytesResumable(storageRef, req.file!.buffer, metadata);
    const url = await getDownloadURL(snapshot.ref);
    res.status(200).json({
        filename: filename,
        url :url
    });
});



