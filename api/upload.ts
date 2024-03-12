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

// Create a MySQL pool


// const pool = mysql.createPool(dbConfig);

// class FileMiddleware {
//   filename = "";
//   public readonly diskLoader = multer({
//     storage: multer.diskStorage({
//       destination: (_req, _file, cb) => {
//         cb(null, path.join(__dirname, "../uploads"));
//       },
//       filename: (req, file, cb) => {
//         const uniqueSuffix =
//           Date.now() + "-" + Math.round(Math.random() * 10000);
//         this.filename = uniqueSuffix + "." + file.originalname.split(".").pop();
//         cb(null, this.filename);
//       },
//     }),
//     limits: {
//       fileSize: 67108864, // 64 MByte
//     },
//   }).single("file");
// }

// const fileUpload = new FileMiddleware();
// router.post("/:uid", fileUpload.diskLoader, (req, res) => {
//   const pictureUrl = "/uploads/" + fileUpload.filename;
//   const title = req.body.title || ''; // If req.body.title is not provided, set title to an empty string
//   const uid = req.params.uid; // Get uid from route parameters

//   // Check if the number of pids for the given uid is greater than or equal to 5
//   pool.query("SELECT COUNT(pid) AS count FROM user_picture WHERE uid = ?", [uid], (err, result) => {
//     if (err) {
//       console.error("Error retrieving count of pids for uid:", err);
//       res.status(500).json({ error: "Internal Server Error" });
//       return;
//     }

//     const count = result[0].count;
//     if (count >= 5) {
//       // If the number of pids is greater than or equal to 5, send an error response
//       res.status(400).json({ error: "The maximum number of pictures for this user has been reached" });
//       return;
//     }

//     // If the number of pids is less than 5, proceed with uploading the file
//     const currentTime = new Date();

//     // Inserting data into MySQL
//     const sql1 = "INSERT INTO `picture` (`title`, `picture_url`,`vid`) VALUES (?, ?,?)";
//     const sql2 = "INSERT INTO `votes` (`vote`, `date`) VALUES (?, ?)";
//     const sql5 = "INSERT INTO `user_picture` (`uid`, `pid`) VALUES (?, ?)";

//     // Insert into votes table with default values
//     pool.query(sql2, [0, currentTime], (err, result) => {
//       if (err) {
//         console.error("Error inserting data into 'votes' table:", err);
//         res.status(500).json({ error: "Internal Server Error" });
//         return;
//       }

//       // Retrieve vid from votes table
//       const votesId = result.insertId;

//       // Insert into picture table with vid from votes table
//       pool.query(sql1, [title, pictureUrl, votesId], (err, result) => {
//         if (err) {
//           console.error("Error inserting data into 'picture' table:", err);
//           res.status(500).json({ error: "Internal Server Error" });
//           return;
//         }

//         // Retrieve pid from picture table
//         const pictureId = result.insertId;

//         // Insert into user_picture table with uid and pid
//         pool.query(sql5, [uid, pictureId], (err, result) => {
//           if (err) {
//             console.error("Error inserting data into 'user_picture' table:", err);
//             res.status(500).json({ error: "Internal Server Error" });
//             return;
//           }

//           // If the upload was successful, send a success response
//           res.json({ filename: pictureUrl });
//         });
//       });
//     });
//   });
// });




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
// router.post("/:uid", fileupload.diskLoader.single("file"), async (req, res) => {
//   const pictureUrl = Date.now() + "-" + Math.round(Math.random() * 10000) + ".png";
//   const title = req.body.title || ''; // If req.body.title is not provided, set title to an empty string
//   const uid = req.params.uid; // Get uid from route parameters

//   // Check if the number of pids for the given uid is greater than or equal to 5
//   conn.query("SELECT COUNT(pid) AS count FROM user_picture WHERE uid = ?", [uid], (err, result) => {
//     if (err) {
//       console.error("Error retrieving count of pids for uid:", err);
//       res.status(500).json({ error: "Internal Server Error" });
//       return;
//     }

//     const count = result[0].count;
//     if (count >= 5) {
//       // If the number of pids is greater than or equal to 5, send an error response
//       res.status(400).json({ error: "The maximum number of pictures for this user has been reached" });
//       return;
//     }

//     // If the number of pids is less than 5, proceed with uploading the file
//     const currentTime = new Date();

//     // gennarate file name
//     const filename = Date.now() + "-" + Math.round(Math.random() * 10000) + ".png";
//     // กำหนดชื่อ file
//     const storageRef = ref(storage, "/image/" + filename);
//     const metadata = {
//       contentType: req.file!.mimetype
//     }
//     // upload
//     uploadBytesResumable(storageRef, req.file!.buffer, metadata)
//       .then(async (snapshot) => {
//         const url = await getDownloadURL(snapshot.ref);

//         // Inserting data into MySQL
//         const sql1 = "INSERT INTO `picture` (`title`, `picture_url`,`point`) VALUES (?, ?,?)";
//         const sql2 = "INSERT INTO `votes` (`vote`, `date`,`pid`) VALUES (?, ?, ?)";
//         const sql5 = "INSERT INTO `user_picture` (`uid`, `pid`) VALUES (?, ?)";

//         // Insert into votes table with default values
//        conn.query(sql2, [0, currentTime], (err, result) => {
//           if (err) {
//             console.error("Error inserting data into 'votes' table:", err);
//             res.status(500).json({ error: "Internal Server Error" });
//             return;
//           }

//           // Retrieve vid from votes table
//           const votesId = result.insertId;

//           // Insert into picture table with vid from votes table
//           conn.query(sql1, [title, url, votesId], (err, result) => {
//             if (err) {
//               console.error("Error inserting data into 'picture' table:", err);
//               res.status(500).json({ error: "Internal Server Error" });
//               return;
//             }

//             // Retrieve pid from picture table
//             const pictureId = result.insertId;

//             // Insert into user_picture table with uid and pid
//             conn.query(sql5, [uid, pictureId], (err, result) => {
//               if (err) {
//                 console.error("Error inserting data into 'user_picture' table:", err);
//                 res.status(500).json({ error: "Internal Server Error" });
//                 return;
//               }

//               // If the upload was successful, send a success response
//               res.status(200).json({ file: url });
//             });
//           });
//         });
//       })
//       .catch((error) => {
//         console.error("Error uploading file to storage:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//       });
//   });
// });



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
    const filename = Date.now() + "-" + Math.round(Math.random() * 10000) + ".png";
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

            // Insert into votes table
            // conn.query(sql3, [0, currentTime, pictureId], (err, result) => {
            //   if (err) {
            //     console.error("Error inserting data into 'votes' table:", err);
            //     res.status(500).json({ error: "Internal Server Error" });
            //     return;
            //   }

              // If the upload was successful, send a success response
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
