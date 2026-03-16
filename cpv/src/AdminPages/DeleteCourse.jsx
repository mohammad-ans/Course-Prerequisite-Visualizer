import { useEffect, useState } from 'react';
import api from '../api';
import "./AddCourse.css"
import { replace, useNavigate } from "react-router-dom";

function DeleteCoursePage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [trigger, setTrigger] = useState(false);
  const [option, setOption] = useState(false)
  async function getCourses() {
    try{
      const response = await api.get("/courses");
      setCourses(response.data);
    }
    catch(error) {
    if(error.status == 403){
        alert("Log In again. Your session has expired.")
        navigate("/signin", replace)
    }
    if(error.response.data && error.response.data.detail) {
      setError(error.response.data.detail[0].msg);
    }
    else {
      setError("An error occured while sending your request");
    }
    }
  }
  useEffect(()=>{
    getCourses();
  }, [trigger])
  async function handleDelete(e){
    e.preventDefault();
    try {
      const response = await api.delete(`/courses/${code}/${option}`);
      setError("");
      setTrigger(t => !t);
    } 
    catch (error) {
      if(error.status == 403){
        alert("Log In again. Your session has expired.");
        navigate("/signin", replace);
      }
      if(error.response.data && error.response.data.detail) {
        setError(error.response.data.detail[0].msg);
      }
      else {
        setError("An error occured while sending your request");
      }
    }
    finally{
      setCode("");
    }
  };
  async function optionChange(e) {
    setOption(pre => !pre);
  }
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
        onChange={e => setCode(e.currentTarget.value)}
      />
      <select value={code} onChange={e => setCode(e.currentTarget.value)}>
        <option value="">Select from the list</option>
        {courses.map((element)=><option key={element.code} value={element.code}>{`${element.code} - ${element.title}`}</option>)}
      </select>
      <div className="update-name">
      <div>
        <input type="checkbox" value={option} onChange={optionChange}/>
        <span>Remove course from all degrees</span>
      </div>

      </div>
      <button type="submit">Delete Course</button>
    </form>
    <div className="course-error courseDel-error">{error}</div>
    </div>
  );
}

export default DeleteCoursePage;
