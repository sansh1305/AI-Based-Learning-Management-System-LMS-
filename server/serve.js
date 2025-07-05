const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = 5000;
const uri = "mongodb+srv://sanshitagoyal2022:Mongodb%402@cluster0.pojny14.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const router = express.Router();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/admin", router);

let db; // Declare db here
let usersCollection;
let coursesCollection;
let QuizCollection;

// Connect to MongoDB Atlas
MongoClient.connect(uri)
  .then((client) => {
    db = client.db("LMSystem"); // Assign db here
    usersCollection = db.collection("users");
    coursesCollection = db.collection("courses");
    QuizCollection = db.collection("Quiz");
    console.log("Connected to DB");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to DB", err);
  });

router.post("/addUser", async (req, res) => {
  const { role, name, username, password, regNum, teacherID, coursesTeaching } = req.body;
  const passwordHash = password; // In production, hash this!

  try {
    const newUser = {
      _id: new ObjectId(),
      username,
      role,
      passwordHash,
      name,
      calendar: [], // every user gets a private calendar
    };

    if (role === "student") {
      newUser.regNum = regNum;
      newUser.enrolledCourses = [];
    } else if (role === "teacher") {
      newUser.teacherID = teacherID;
      newUser.coursesTeaching = coursesTeaching;
    } else {
      return res.status(400).json({ error: "Invalid role" });
    }

    await usersCollection.insertOne(newUser);
    res.json({ message: `${role} added successfully`, user: newUser });
  } catch (err) {
    console.error("Failed to add user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login route
app.post("/login", async (req, res) => {
  let { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ message: "Missing fields" });
  }

  username = username.trim();
  role = role.trim().toLowerCase();
  password = password.trim();

  const user = await usersCollection.findOne({ username, role });

  if (!user) {
    return res.status(401).json({ message: "Invalid username or role" });
  }

  if (user.passwordHash !== password) {
    return res.status(401).json({ message: "Invalid password" });
  }

  res.json({
    message: "Login successful",
    user: {
      username: user.username,
      role: user.role,
      name: user.name,
      _id: user._id,
      enrolledCourses: user.enrolledCourses || [],
      coursesTeaching: user.coursesTeaching || [],
    },
  });
});

// ✅ Fix: Use coursesCollection which was assigned after db connection
app.get("/courses/:id", async (req, res) => {
  const courseId = req.params.id;

  try {
    const course = await coursesCollection.findOne({ courseId });
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (err) {
    console.error("Error fetching course:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/enroll/:id", async (req, res) => {
  const courseId = req.params.id;
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    // Find course by custom courseId
    const course = await coursesCollection.findOne({ courseId });
    if (!course) return res.status(404).json({ error: "Course not found" });

    if (course.seats <= 0) {
      return res.status(400).json({ error: "No seats available" });
    }

    // Decrement seats by 1
    await coursesCollection.updateOne({ courseId }, { $inc: { seats: -1 } });

    // Add courseId to user's enrolled courses (optional, you need a user collection update)
    await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $addToSet: { enrolledCourses: courseId } });

    res.json({ message: "Enrollment successful" });
  } catch (err) {
    console.error("Error enrolling user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get detailed enrolled courses for a user
app.get("/user/:userId/enrolled-courses", async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user || !user.enrolledCourses || user.enrolledCourses.length === 0) {
      return res.json([]);
    }

    // Fetch course details by courseId (not _id)
    const courses = await coursesCollection.find({ courseId: { $in: user.enrolledCourses } }).toArray();

    res.json(courses);
  } catch (err) {
    console.error("Error fetching enrolled courses:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get detailed courses for a teacher by userId
app.get("/teacher/:userId/courses", async (req, res) => {
  const userId = req.params.userId;

  try {
    const teacher = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!teacher || teacher.role !== "teacher") {
      return res.status(403).json({ error: "Unauthorized or not a teacher" });
    }

    if (!teacher.coursesTeaching || teacher.coursesTeaching.length === 0) {
      return res.json([]);
    }

    // Fetch all courses that match the courseIds in coursesTeaching
    const courses = await coursesCollection.find({ courseId: { $in: teacher.coursesTeaching } }).toArray();

    res.json(courses);
  } catch (err) {
    console.error("Error fetching teacher courses:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//chuck this part when u dont need file ka kaaam

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const courseId = req.params.courseId;
    const dir = `uploads/${courseId}`;
    fs.mkdirSync(dir, { recursive: true }); // Ensure dir exists
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Upload file to specific course
app.post("/upload/:courseId", upload.single("file"), async (req, res) => {
  const { courseId } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const fileData = {
      name: file.originalname,
      url: `uploads/${courseId}/${file.filename}`,
      uploadedAt: new Date(),
    };

    await coursesCollection.updateOne({ courseId }, { $push: { files: fileData } });

    res.json({ message: "File uploaded successfully", file: fileData });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Add to your server.js
app.get("/files/:courseId", async (req, res) => {
  const { courseId } = req.params;
  try {
    const course = await coursesCollection.findOne({ courseId });
    if (!course || !course.files) return res.json([]);
    res.json(course.files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get course files" });
  }
});

// Delete a specific file from a course
app.delete("/delete/:courseId/:filename", async (req, res) => {
  const { courseId, filename } = req.params;

  try {
    const course = await coursesCollection.findOne({ courseId });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const fileEntry = course.files.find((f) => f.name === filename);
    if (!fileEntry) {
      return res.status(404).json({ error: "File not found in course" });
    }

    const filePath = path.join(__dirname, fileEntry.url);
    fs.unlinkSync(filePath); // delete from filesystem

    // remove from MongoDB
    await coursesCollection.updateOne({ courseId }, { $pull: { files: { name: filename } } });

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting file" });
  }
});

//Calendar wala part

app.get("/calendar/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.calendar || []);
  } catch (err) {
    console.error("Fetch calendar error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/calendar/:userId/add-event", async (req, res) => {
  const { userId } = req.params;
  const newEvent = req.body;

  if (!newEvent || Object.keys(newEvent).length === 0) {
    return res.status(400).json({ error: "Event data required" });
  }

  try {
    // Push newEvent into the calendar array for the user
    await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $push: { calendar: newEvent } });

    res.json({ message: "Event added successfully" });
  } catch (err) {
    console.error("Error adding event:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/calendar/:userId", async (req, res) => {
  const { userId } = req.params;
  const event = req.body;

  try {
    const result = await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $pull: { calendar: event } });
    res.json({ message: "Event removed", result });
  } catch (err) {
    console.error("Delete calendar event error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

//quiz wala part

// Get Quiz for a course (student)
app.get("/quiz/:courseId", async (req, res) => {
  const courseId = req.params.courseId;
  const now = new Date();

  console.log("Fetching quizzes for course:", courseId);
  console.log("Current UTC time:", now.toISOString());
  const quizzes = await QuizCollection.find({ courseId }).toArray();
  console.log(
    "All quizzes for this course:",
    quizzes.map((q) => ({
      title: q.title,
      start: q.startTime,
      end: q.endTime,
    }))
  );

  try {
    const activeQuizzes = await QuizCollection.find({
      courseId,
      startTime: { $lte: now },
      endTime: { $gte: now },
    }).toArray();

    activeQuizzes.forEach((q) => {
      console.log("📘 Active Quiz:", q.title, "| Start:", q.startTime, "| End:", q.endTime);
    });

    res.json(activeQuizzes);
  } catch (err) {
    console.error("Error fetching quizzes:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Submit quiz (student)
app.post("/quiz/:quizId/submit", async (req, res) => {
  const { quizId } = req.params;
  const { studentId, answers } = req.body;
  const quiz = await QuizCollection.findOne({ _id: new ObjectId(quizId) });

  let score = 0;
  quiz.questions.forEach((q, i) => {
    if (q.correctAnswer === answers[i]) score++;
  });

  await usersCollection.updateOne(
    { _id: new ObjectId(studentId) },
    {
      $push: {
        quizResults: {
          quizId,
          score,
          answers,
        },
      },
    }
  );

  res.json({ message: "Submitted", score });
});

app.post("/quiz/create", async (req, res) => {
  try {
    const quizData = req.body;

    quizData.startTime = new Date(quizData.startTime);
    quizData.endTime = new Date(quizData.endTime);

    const result = await QuizCollection.insertOne(quizData);
    res.status(201).json({ message: "Quiz created successfully", quizId: result.insertedId });
  } catch (err) {
    console.error("Error creating quiz:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/quiz/id/:quizId", async (req, res) => {
  try {
    const quiz = await QuizCollection.findOne({ _id: new ObjectId(req.params.quizId) });
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

//ML Code wala doc submission

const storage_ML = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/ML";
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload_ML = multer({ storage: storage_ML });

// Upload route
app.post("/upload", upload_ML.single("file"), (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileData = {
    name: file.originalname,
    filename: file.filename,
    url: `/uploads/ML/${file.filename}`,
    uploadedAt: new Date(),
  };

  // Normally you’d save fileData to a database — skipping that here

  res.json({ message: "File uploaded successfully", file: fileData });
});

//actually calling ML wali api
const { spawn } = require("child_process");

app.get("/process-pdf", (req, res) => {
  const filename = req.query.filename;
  const filePath = path.join(__dirname, "uploads", "ML", filename);
  const normalizedPath = filePath.replace(/\\/g, "/");
  console.log("Sending file to Python at:", normalizedPath);

  exec(`python3 ml/process_pdf.py "${normalizedPath}"`, (err, stdout, stderr) => {
    if (err) {
      console.error("Python error (stderr):", stderr);
      console.error("Python output (stdout):", stdout);
      return res.status(500).json({ error: "Python processing failed", stderr });
    }

    console.log("Python script output:", stdout);

    const outputPath = path.join(__dirname, "ml", "questions_output.json");
    fs.readFile(outputPath, "utf8", (err, data) => {
      if (err) return res.status(500).json({ error: "Failed to read output" });
      const questions = JSON.parse(data);
      res.json(questions);
    });
  });
});
