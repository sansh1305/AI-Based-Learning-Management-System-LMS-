import { useState } from "react";
import { useLocation, Link } from "react-router-dom";

const CreateQuiz = () => {
  const location = useLocation();
  const user = location.state?.user;

  const [quiz, setQuiz] = useState({
    title: "",
    courseId: "",
    startTime: "",
    endTime: "",
    questions: [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }],
  });

  const handleAddQuestion = () => {
    setQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, { question: "", options: ["", "", "", ""], correctAnswer: 0 }],
    }));
  };

  const handleSubmit = async () => {
    if (!user || !user._id) {
      alert("User not found. Please log in again.");
      return;
    }

    const body = { ...quiz, createdBy: user._id };
    const res = await fetch("http://localhost:5000/quiz/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    alert(data.message);
  };
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Create Quiz</h2>
      <input type="text" placeholder="Quiz Title" value={quiz.title} onChange={(e) => setQuiz({ ...quiz, title: e.target.value })} />
      <input type="text" placeholder="Course ID" value={quiz.courseId} onChange={(e) => setQuiz({ ...quiz, courseId: e.target.value })} />
      <input type="datetime-local" onChange={(e) => setQuiz({ ...quiz, startTime: e.target.value })} />
      <input type="datetime-local" onChange={(e) => setQuiz({ ...quiz, endTime: e.target.value })} />

      {quiz.questions.map((q, idx) => (
        <div key={idx}>
          <input
            placeholder="Question"
            value={q.question}
            onChange={(e) =>
              setQuiz((prev) => {
                const questions = [...prev.questions];
                questions[idx].question = e.target.value;
                return { ...prev, questions };
              })
            }
          />
          {q.options.map((opt, i) => (
            <input
              key={i}
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) =>
                setQuiz((prev) => {
                  const questions = [...prev.questions];
                  questions[idx].options[i] = e.target.value;
                  return { ...prev, questions };
                })
              }
            />
          ))}
          <label>
            Correct Answer:
            <select
              value={q.correctAnswer}
              onChange={(e) =>
                setQuiz((prev) => {
                  const questions = [...prev.questions];
                  questions[idx].correctAnswer = parseInt(e.target.value);
                  return { ...prev, questions };
                })
              }
            >
              {[0, 1, 2, 3].map((val) => (
                <option key={val} value={val}>
                  Option {val + 1}
                </option>
              ))}
            </select>
          </label>
        </div>
      ))}

      <button onClick={handleAddQuestion}>Add Question</button>
      <br></br>
      <button onClick={handleSubmit}>Submit Quiz</button>
      <br></br>
      <Link to="/teacher" state={{ user }}>
        <button className="bg-blue-600 text-white px-4 m-10 py-2 rounded hover:bg-blue-700">Go Back</button>
      </Link>
    </div>
  );
};

export default CreateQuiz;
