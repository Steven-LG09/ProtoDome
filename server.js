import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import multer from "multer";
import mongoose from 'mongoose';
import { google } from "googleapis";
import streamifier from "streamifier";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9000;
const allowedUser1 = process.env.allowedUser1;
const allowedUser2 = process.env.allowedUser2;
const allowedUser3 = process.env.allowedUser3;
const allowedPass = process.env.allowedPass;

app.use(express.static(process.env.STATIC));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const resumeSchema = new mongoose.Schema({
  userName: String,
  fileUrl: String
});
const evaluationSchema = new mongoose.Schema({
  professor: String,
  course: String,
  question1: Number,
  question2: Number,
  question3: Number,
  question4: Number,
  question5: Number,
  question6: Number,
  question7: Number,
  question8: Number,
  question9: Number,
  question10: Number,
  comment: String
});
const userSchema = new mongoose.Schema({
  user: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  academic: { type: String, required: true },
});

const Resume = mongoose.models[process.env.COLLECTION_NAME] || mongoose.model(process.env.COLLECTION_NAME, resumeSchema);
const Evaluation = mongoose.models[process.env.COLLECTION_NAME2] || mongoose.model(process.env.COLLECTION_NAME2, evaluationSchema);
const User = mongoose.models[process.env.COLLECTION_NAME] || mongoose.model(process.env.COLLECTION_NAME, userSchema);

const upload = multer({ storage: multer.memoryStorage() });

function generatePassword(length = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pass = "";
  for (let i = 0; i < length; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass;
}

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS), 
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

async function makeFilePublic(fileId) {
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: "reader",
      type: "anyone", 
    },
  });

  return `https://lh3.googleusercontent.com/d/${fileId}=w1000`;
}
app.get('/', (req, res) => {
    res.sendFile(__dirname + process.env.MAIN);
});
app.post("/login", async (req, res) => {
    const { user, password } = req.body;
    try {
        let redirectUrl;
        if (user === allowedUser1 && password === allowedPass) {
          redirectUrl = process.env.PRIVATE_MAIN;
        } else if (user === allowedUser2 && password === allowedPass) {
          redirectUrl = process.env.CREATENTE;
            } else if (user === allowedUser3 && password === allowedPass) {
            redirectUrl = process.env.PUBLIC_MAIN;
                }else {
                    return res
                        .status(403)
                        .json({ success: false, message: "Usuario No Autorizado" });
                    }
  
        return res.json({
          success: true,
          redirectUrl,
        });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Error Iniciando Sesión: " + error.message });
    }
});
app.post('/posthdv', upload.single("photo"), async (req, res) => {
  try {
    const { name } = req.body;

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    if (!name) return res.status(400).json({ error: "Missing required fields" });

    const fileMetadata = {
      name: req.file.originalname,
      parents: [process.env.DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType: req.file.mimetype,
      body: streamifier.createReadStream(req.file.buffer),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });

    const fileId = response.data.id;

    const publicUrl = await makeFilePublic(fileId);

    const newResume = new Resume({ 
      fileUrl: publicUrl,
      userName: name 
    });
    await newResume.save();

    res.json({ message: "Upload successful", success: true, redirectUrl: process.env.THANKS });

  } catch (error) {
    console.error("Storage Upload Error:", error);
    res.status(500).json({ error: error.message });
  }
});
app.get("/qualiMe", async (req, res) => {
  try {
      const resumes = await Resume.find({}, "userName fileUrl -_id");

      if (resumes.length === 0) {
          return res.status(404).json({ message: "No resumes found" });
      }

      res.json(resumes);
  } catch (error) {
      console.error("Error fetching resumes:", error);
      res.status(500).json({ error: "Failed to fetch resumes" });
  }
});
app.get('/sPage', (req, res) => {
  const name = req.query.name; 

  if (name) {
      res.json({ 
          success: true, 
          redirectUrl: `/stadistic.html?name=${encodeURIComponent(name)}` 
      });
  } else {
      res.json({ success: false, message: "Name is required" });
  }
});
app.get('/oPage', (req, res) => {
  const name = req.query.name; 

  if (name) {
      res.json({ 
          success: true, 
          redirectUrl: `/observation.html?name=${encodeURIComponent(name)}` 
      });
  } else {
      res.json({ success: false, message: "Name is required" });
  }
});
app.get('/ePage', (req, res) => {
  const name = req.query.name; 

  if (name) {
      res.json({ 
          success: true, 
          redirectUrl: `/evaluationPage.html?name=${encodeURIComponent(name)}` 
      });
  } else {
      res.json({ success: false, message: "Name is required" });
  }
});
app.post('/postEva', async (req, res) => {
  try {
    const {professor,course,question1,question2,question3,question4,question5,question6,question7,
        question8,question9,question10,comment} = req.body;

    const newEvaluation = new Evaluation({ 
      professor: professor,
      course: course,
      question1: question1,
      question2: question2,
      question3: question3,
      question4: question4,
      question5: question5,
      question6: question6,
      question7: question7,
      question8: question8,
      question9: question9,
      question10: question10,
      comment: comment
    });
    await newEvaluation.save();

    res.json({ message: "Upload successful",success: true, redirectUrl: process.env.THANKS2});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/count", async (req, res) => {
  try {
      const count = await Resume.countDocuments();
      res.json({ count });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});
app.get("/count2", async (req, res) => {
  try {
      const count = await Evaluation.countDocuments();
      res.json({ count });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});
app.post("/addUsers", async (req, res) => {
  try {
    const { users, academic } = req.body;
    const createdUsers = [];

    // Buscar usuarios ya existentes con nombres similares
    const existingUsers = await User.find({ user: /docente\d+/ });
    const numbers = existingUsers
      .map(u => parseInt(u.user.replace("docente", "")))
      .filter(n => !isNaN(n));
    let currentIndex = numbers.length ? Math.max(...numbers) + 1 : 1;

    for (let i = 0; i < users; i++) {
      const userName = `docente${currentIndex}`;
      const password = generatePassword();
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        user: userName,
        password: hashedPassword,
        academic,
      });

      await newUser.save();
      createdUsers.push({ user: userName, password });
      currentIndex++;
    }

    res.status(200).json({ message: "Usuarios creados", createdUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear usuarios" });
  }
});
app.get("/stats", async (req, res) => {
  try {
      const respuestas = await Evaluation.find(); 
      res.json(respuestas);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});
app.post("/cDocente", (req, res) => {
  res.json({ success: true, redirectUrl: process.env.USER_CREATION });
});
app.post("/rPrivate", (req, res) => {
  res.json({ success: true, redirectUrl: process.env.RESULTS });
});
app.get("/rPage", (req, res) => {
  const name = req.query.name; 

  if (name) {
      res.json({ 
          success: true, 
          redirectUrl: `/resumePage.html?name=${encodeURIComponent(name)}` 
      });
  } else {
      res.json({ success: false, message: "Name is required" });
  }
});
app.get('/get-resume', async (req, res) => {
  try {
      const { name } = req.query;

      if (!name) {
          return res.status(400).json({ error: 'Name is required' });
      }
      const userName=name

      const resumeData = await Resume.findOne({ userName });

      if (!resumeData) {
          return res.status(404).json({ error: 'Resume not found' });
      }

      res.json({ data: resumeData });
  } catch (error) {
      console.error("Error fetching resume:", error);
      res.status(500).json({ error: error.message });
  }
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
