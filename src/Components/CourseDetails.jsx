import { useLocation, useParams, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";

function CourseDetails() {
  const location = useLocation();
  const { user } = location.state || {}; // ✅ FIXED: Now user is defined

  const userId = user?._id;
  const enrolledCourses = useMemo(() => user?.enrolledCourses || [], [user]);
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/courses/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCourse(data);
        // ✅ Check if user is already enrolled
        if (enrolledCourses.includes(data.courseId)) {
          setEnrolled(true);
        }
      })
      .catch((err) => console.error(err));
  }, [id, enrolledCourses]);

  const handleEnroll = async () => {
    const res = await fetch(`http://localhost:5000/enroll/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (res.ok) {
      setEnrolled(true);
      setCourse((prev) => ({ ...prev, seats: prev.seats - 1 }));
    }
  };

  if (!course) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Course Name: {course.name}</h1>
      <p className="mb-4">About the Course: {course.description}</p>
      <p className="mb-2">Available Seats: {course.seats}</p>
      <p className="mb-2">Teacher: {course.teacherName}</p>
      <p className="mb-2">Teacher ID: {course.teacherID}</p>
      <img src={course.imageUrl} alt={course.name} className="mb-4" />

      {enrolled ? (
        <button className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed" disabled>
          Already Enrolled
        </button>
      ) : course.seats > 0 ? (
        <button onClick={handleEnroll} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Enroll Now
        </button>
      ) : (
        <p className="text-red-600 mt-2">No seats available.</p>
      )}

      <Link to="/stud" state={{ user }}>
        <button className="bg-blue-600 text-white px-4 m-10 py-2 rounded hover:bg-blue-700">Go Back</button>
      </Link>
    </div>
  );
}

export default CourseDetails;
