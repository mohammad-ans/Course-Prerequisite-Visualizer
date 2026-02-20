import { useState } from 'react';
import api from '../api';
import "./AddCourse.css"

function DeleteCoursePage() {
  const [code, setCode] = useState("");

  async function handleDelete(){
    e.preventDefault();
    try {
      const response = await api.delete(`/courses/${code}`);
      console.log('Course deleted:', code);
      setCode("");
      document.querySelector(".courseDel-error").innerHTML = "";
    } 
    catch (error) {
      const element = document.querySelector(".courseDel-error");
      if(error.response.data.detail)
        element.innerHTML = error.response.data.detail[0].msg;
      else
        element.innerHTML = "An error occured while sending your request";
      // setCode("");
    }
  };

  return (
    <div className="course-page">
      <h2 className="dashboard-headings">
        Delete Course
      </h2>
    <form onSubmit={handleDelete} className="add-course-main">
      <input
        type="text"
        placeholder="Course code to delete"
        value={code}
        onChange={e => setCode(e.target.value)}
      />
      <button type="submit">Delete Course</button>
    </form>
    <div className="course-error courseDel-error"></div>
    </div>
  );
}

export default DeleteCoursePage;
