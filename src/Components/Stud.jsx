import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import image1 from "../assets/images/image1.png";
import image2 from "../assets/images/image2.png";
import image3 from "../assets/images/image3.png";
import image4 from "../assets/images/image4.png";
import image5 from "../assets/images/image5.png";
import image6 from "../assets/images/image6.png";

function Stud() {
  const location = useLocation();
  const { user } = location.state || {};
  const [enrolledCourseDetails, setEnrolledCourseDetails] = useState([]);

  useEffect(() => {
    if (user?._id) {
      fetch(`http://localhost:5000/user/${user._id}/enrolled-courses`)
        .then((res) => res.json())
        .then((data) => setEnrolledCourseDetails(data))
        .catch((err) => console.error("Error loading enrolled course details:", err));
    }
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mt-6">Welcome {user?.name || "Student"}</h1>
      <div className="mt-14 mx-5 lg:mx-20 overflow-hidden">
        <h3>More Courses to Explore</h3>
        <div className="w-max flex animate-scroll">
          <div className="flex gap-6">
            <Link to={`/course/BCSE101L`} state={{ user }}>
              <img src={image1} alt="course1" className="h-36 bg-[#161b22] rounded-xl p-4" />
            </Link>
            <Link to={`/course/BCSE102L`} state={{ user }}>
              <img src={image2} alt="course2" className="h-36 bg-[#161b22] rounded-xl p-4" />
            </Link>
            <Link to={`/course/BCSE103L`} state={{ user }}>
              <img src={image3} alt="course3" className="h-36 bg-[#161b22] rounded-xl p-4" />
            </Link>
            <Link to={`/course/BCSE104L`} state={{ user }}>
              <img src={image4} alt="course4" className="h-36 bg-[#161b22] rounded-xl p-4" />
            </Link>
            <Link to={`/course/BCSE105L`} state={{ user }}>
              <img src={image5} alt="course5" className="h-36 bg-[#161b22] rounded-xl p-4" />
            </Link>
            <Link to={`/course/BCSE106L`} state={{ user }}>
              <img src={image6} alt="course6" className="h-36 bg-[#161b22] rounded-xl p-4" />
            </Link>

            {/* Duplicate images for loop */}
            <Link to={`/course/BCSE101L`} state={{ user }}>
              <img src={image1} alt="course1" className="h-36 bg-[#161b22] rounded-xl p-4" />
            </Link>
            <Link to={`/course/BCSE102L`} state={{ user }}>
              <img src={image2} alt="course2" className="h-36 bg-[#161b22] rounded-xl p-4" />
            </Link>
            <Link to={`/course/BCSE103L`} state={{ user }}>
              <img src={image3} alt="course3" className="h-36 bg-[#161b22] rounded-xl p-4" />
            </Link>
          </div>
        </div>
      </div>

      <div>
        {" "}
        <h3>Courses Enrolled in</h3>
      </div>

      {enrolledCourseDetails.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-center">
          {enrolledCourseDetails.map((course) => (
            <Link key={course.courseId} to={`/course/${course.courseId}/files`} state={{ user }} className="block border rounded p-4 shadow hover:shadow-lg transition">
              <img src={course.imageUrl} alt={course.name} className="w-full h-40 object-cover mb-2 rounded" />
              <h3 className="text-lg font-semibold">{course.name}</h3>
              <p className="text-sm">{course.description}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p>No enrolled courses.</p>
      )}
      <Link to={`/calendar/${user?._id}`} state={{ user }}>
        <button>View Calendar</button>
      </Link>
      <br></br>

      <div>
        <h2>Select a course to see quizzes:</h2>
        <ul>
          {user?.enrolledCourses?.length > 0 ? (
            user.enrolledCourses.map((courseId) => (
              <li key={courseId}>
                <Link to={`/quizlist/${courseId}`} state={{ user }}>
                  <button>{courseId}</button>
                </Link>
              </li>
            ))
          ) : (
            <p>No enrolled courses found.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Stud;
