import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

const QuizList = () => {
  const { courseId } = useParams(); // ✅ Correct way
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const user = location.state?.user;

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const res = await fetch(`http://localhost:5000/quiz/${courseId}`);
        const data = await res.json();
        setQuizzes(data);
      } catch (err) {
        console.error("Failed to fetch quizzes", err);
      } finally {
        setLoading(false);
      }
    }

    fetchQuizzes();
  }, [courseId]);

  if (loading) return <p>Loading quizzes...</p>;
  if (quizzes.length === 0) {
    return (
      <div>
        <p>No active quizzes right now.</p>
        <Link to="/stud" state={{ user }}>
          <button className="bg-blue-600 text-white px-4 m-10 py-2 rounded hover:bg-blue-700">Go Back</button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2>Available Quizzes for {courseId}</h2>
      <ul>
        {quizzes.map((quiz) => (
          <li key={quiz._id}>
            <Link to={`/attemptquiz/${quiz._id}`} state={{ user }}>
              {quiz.title} (Start: {new Date(quiz.startTime).toLocaleString()})
            </Link>
            <Link to="/stud" state={{ user }}>
              <button className="bg-blue-600 text-white px-4 m-10 py-2 rounded hover:bg-blue-700">Go Back</button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuizList;
