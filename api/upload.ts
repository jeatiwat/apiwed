import express from "express";
import path from "path";
import multer from "multer";

export const router = express.Router();

router.get("/",(req,res)=>{
    res.send("Upload");
});


import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL,deleteObject } from "firebase/storage";

// key ก่อน
// apiKey: "AIzaSyC-NHZoh1twNsTs0PHjkCIydxcHISrCqEE"


const firebaseConfig = {
    apiKey: "AIzaSyDB0wentj8Igqan_Bpe7g-MOEvCSSiSnt0",
    authDomain: "api-test-94f3b.firebaseapp.com",
    projectId: "api-test-94f3b",
    storageBucket: "api-test-94f3b.appspot.com",
    messagingSenderId: "291742907529",
    appId: "1:291742907529:web:ea2f1dc03bcbde0462da58",
    measurementId: "G-P99T31SED3"
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