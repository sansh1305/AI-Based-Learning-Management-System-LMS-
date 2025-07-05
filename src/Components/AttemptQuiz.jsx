import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const AttemptQuiz = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(null);
  const location = useLocation();
  const user = location.state?.user;

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await fetch(`http://localhost:5000/quiz/id/${quizId}`); // ✅ Use correct route
        if (!res.ok) throw new Error("Failed to fetch quiz");
        const data = await res.json();
        setQuiz(data);
        setAnswers(new Array(data.questions.length).fill(null));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [quizId]);

  const handleAnswerChange = (idx, optionIdx) => {
    const newAnswers = [...answers];
    newAnswers[idx] = optionIdx;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.includes(null)) {
      alert("Please answer all questions.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/quiz/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: user._id, answers }), // ✅ Use user._id
      });
      const data = await res.json();
      if (res.ok) {
        setScore(data.score);
      } else {
        alert(data.error || "Error submitting quiz");
      }
    } catch (err) {
      console.error(err);
      alert("Submission failed.");
    }
  };

  if (loading) return <p>Loading quiz...</p>;
  if (!quiz) return <p>Quiz not found.</p>;
  if (!user) return <div>Error: No user data provided.</div>;

  if (score !== null)
    return (
      <div>
        <h2>
          Your Score: {score} / {quiz.questions.length}
        </h2>
        <Link to="/stud" state={{ user }}>
          <button className="bg-blue-600 text-white px-4 m-10 py-2 rounded hover:bg-blue-700">Go Back</button>
        </Link>
      </div>
    );

  return (
    <div>
      <h2>{quiz.title}</h2>
      {quiz.questions.map((q, idx) => (
        <div key={idx} style={{ marginBottom: "1rem" }}>
          <p>
            <b>Q{idx + 1}:</b> {q.question}
          </p>
          {q.options.map((opt, i) => (
            <label key={i} style={{ display: "block" }}>
              <input type="radio" name={`question-${idx}`} value={i} checked={answers[idx] === i} onChange={() => handleAnswerChange(idx, i)} />
              {opt}
            </label>
          ))}
        </div>
      ))}
      <button onClick={handleSubmit}>Submit Quiz</button>
      <Link to={"/stud"} state={{ user }}>
        <button className="bg-blue-600 text-white px-4 m-10 py-2 rounded hover:bg-blue-700">Go Back</button>
      </Link>
    </div>
  );
};

export default AttemptQuiz;
