import express from "express";
import path from "path";
import multer from "multer";

export const router = express.Router();

router.get("/",(req,res)=>{
    res.send("upload");
});


import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL,deleteObject } from "firebase/storage";

import { getAnalytics } from "firebase/analytics";
// key ก่อน
// apiKey: "AIzaSyC-NHZoh1twNsTs0PHjkCIydxcHISrCqEE"


const firebaseConfig = {
  apiKey: "AIzaSyBWibpAwgLsYEgYDHjVuSognrQW2VCNbVI",
  authDomain: "projectwed-cc3fc.firebaseapp.com",
  projectId: "projectwed-cc3fc",
  storageBucket: "projectwed-cc3fc.appspot.com",
  messagingSenderId: "542332922077",
  appId: "1:542332922077:web:79b741f3c9265f8fde5334",
  measurementId: "G-HHF17SY421"
};

// Initialize Firebase


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

router.post("/", fileupload.diskLoader.single("file"), async (req, res) => {
  if (req.file && req.file.mimetype) {
      const filename = Math.round(Math.random() * 100000) + '.png';
      const storageRef = ref(storage, "/images/" + filename);
      const metadata = { contentType: req.file.mimetype };
      const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
      const url = await getDownloadURL(snapshot.ref);
      res.status(200).json({
          filename: filename,
          url: url
      });
  } else {
      res.status(400).json({ error: 'No file uploaded or invalid file' });
  }
});