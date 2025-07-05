import { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

const CalendarPage = () => {
  const { userId } = useParams();
  const [events, setEvents] = useState([]);
  const location = useLocation();
  const { user } = location.state || {};

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/calendar/${userId}`)
      .then((res) => res.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [userId]);

  const addEventToDB = async (newEvent) => {
    try {
      const res = await fetch(`http://localhost:5000/calendar/${userId}/add-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });

      if (!res.ok) {
        throw new Error("Failed to save event");
      }

      setEvents((prev) => [...prev, newEvent]);
    } catch (err) {
      console.error(err);
      alert("Failed to add event");
    }
  };

  const handleDateClick = (arg) => {
    const title = prompt("Enter event title:");
    if (!title) return;

    const newEvent = {
      title,
      start: arg.dateStr,
      end: arg.dateStr,
    };

    addEventToDB(newEvent);
  };

  const handleEventClick = (info) => {
    const confirmDelete = window.confirm(`Delete event "${info.event.title}"?`);
    if (!confirmDelete) return;

    const eventToDelete = {
      title: info.event.title,
      start: info.event.startStr,
      end: info.event.endStr || info.event.startStr,
    };

    fetch(`http://localhost:5000/calendar/${user._id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventToDelete),
    })
      .then((res) => res.json())
      .then(() => {
        setEvents((prev) => prev.filter((e) => !(e.title === eventToDelete.title && e.start === eventToDelete.start && e.end === eventToDelete.end)));
      })
      .catch((err) => {
        console.error("Failed to delete event:", err);
        alert("Error deleting event");
      });
  };

  const backLink = user?.role === "teacher" ? "/teacher" : "/stud";

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">My Calendar</h2>
      <FullCalendar plugins={[dayGridPlugin, interactionPlugin]} initialView="dayGridMonth" events={events} dateClick={handleDateClick} eventClick={handleEventClick} height="auto" />

      <Link to={backLink} state={{ user }}>
        <button className="bg-blue-600 text-white px-4 m-10 py-2 rounded hover:bg-blue-700">Go Back</button>
      </Link>
    </div>
  );
};

export default CalendarPage;
