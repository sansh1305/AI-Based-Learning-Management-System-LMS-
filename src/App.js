import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sign from "./Components/Sign";
import Stud from "./Components/Stud";
import CourseDetails from "./Components/CourseDetails";
import Teacher from "./Components/Teacher";
import CourseFiles from "./Components/CourseFiles";
import CalendarPage from "./Components/CalendarPage";
import TeacherCourseFile from "./Components/TeacherCourseFile";
import CreateQuiz from "./Components/CreateQuiz";
import QuizList from "./Components/QuizList";
import AttemptQuiz from "./Components/AttemptQuiz";
import Llm from "./Components/Llm";
import Admin from "./Components/Admin";

import "./App.css";

function App() {
  return (
    <div className="app-container">
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Sign />
              </>
            }
          />
          <Route path="/stud" element={<Stud />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/course/:id" element={<CourseDetails />} />
          <Route path="/course/:courseId/files" element={<CourseFiles />} />
          <Route path="/teachercourse/:courseId/file" element={<TeacherCourseFile />} />
          <Route path="/calendar/:userId" element={<CalendarPage />} />
          <Route path="/createquiz/:userId" element={<CreateQuiz />} />
          <Route path="/quizlist/:courseId" element={<QuizList />} />
          <Route path="/attemptquiz/:quizId" element={<AttemptQuiz />} />
          <Route path="/llm/:userId" element={<Llm />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
