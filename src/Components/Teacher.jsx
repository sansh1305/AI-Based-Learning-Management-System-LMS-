import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

function Teacher() {
  const location = useLocation();
  const { user } = location.state || {};
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (user?.role === "teacher") {
      fetch(`http://localhost:5000/teacher/${user._id}/courses`)
        .then((res) => res.json())
        .then((data) => setCourses(data))
        .catch((err) => console.error("Failed to fetch teacher's courses", err));
    }
  }, [user]);

  if (!user || user.role !== "teacher") {
    return <p className="text-red-600 text-center mt-10">Unauthorized. You are not a teacher.</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Welcome, {user.name}</h1>
      <h2 className="text-lg mb-4 text-center">Courses You Teach:</h2>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div key={course.courseId} className="border p-4 rounded shadow">
              <h3 className="text-xl font-semibold">{course.name}</h3>
              <p className="text-sm mb-2">{course.description}</p>
              <p className="text-sm mb-2">Course ID: {course.courseId}</p>

              <Link key={course.courseId} to={`/TeacherCourse/${course.courseId}/File`} state={{ user }} className="block border rounded p-4 shadow hover:shadow-lg transition">
                <img src={course.imageUrl} alt={course.name} className="w-full h-40 object-cover mb-2 rounded" />
                <h3 className="text-lg font-semibold">{course.name}</h3>
                <p className="text-sm">{course.description}</p>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center">No courses assigned to you.</p>
      )}

      <Link to={`/calendar/${user?._id}`} state={{ user }}>
        <button>View Calendar</button>
      </Link>
      <br></br>
      <Link to={`/llm/${user?._id}`} state={{ user }}>
        <button>To Generate Questions</button>
      </Link>
      <br></br>
      <Link to={`/createquiz/${user?._id}`} state={{ user }}>
        <button>Add Quiz</button>
      </Link>
    </div>
  );
}

export default Teacher;
