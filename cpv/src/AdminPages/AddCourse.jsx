import { useEffect, useState, useRef } from 'react'
import "./AddCourse.css"
import api from '../api'
import { useNavigate, replace } from 'react-router-dom';

function AddCoursePage() {
  const [code, setCode] = useState("");
  const [cHours, setHours] = useState("");
  const [title, setTitle] = useState("");
  const [availablePreReqs, setAvailablePreReqs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const errorRef = useRef();
  const [fetchCourses, setFetch] = useState(false);
  const navigate = useNavigate();
  useEffect(()=>{
    async function func(){
      try{
        const response = await api.get("/courses");
        // const arr = response.data.map((element) => element.code + " - " + element.title);
        setAvailablePreReqs(response.data);
      }
      catch(error){
        errorRef.current.style.color = "red";
        if(error.status == 401){
            alert("Log In again. Your session has expired.")
            navigate("/signin", replace)
        }
        else
            setError("Error occured while fetching courses for pre-reqs list.");
      }
    }
    func();
  }, [fetchCourses])

  function coursesHandler(e){
    const temp = e.target.value;
    if(temp === "")
      return;
    const tempObj = availablePreReqs.find(element => element.code == temp).title;
    setCourses(p => [...courses, {code : temp, title : tempObj}]);
    setAvailablePreReqs(p => p.filter((element) => element.code != temp));
    let element;
    try{
      element = e.target;
    }
    catch{}
    finally{
      if (!element)
          element = document.querySelector(".add-courselist");
      element.value = "";
      element.focus();
    }
  }

  function removeCourse(e) {
    const course = e.currentTarget.parentNode.dataset.value;
      setAvailablePreReqs([...availablePreReqs, {code : course, title : courses.find(element => element.code == course).title}]);
      setCourses(p => p.filter((el)=> el.code != course));
  }
  async function handleSubmit(e){
    e.preventDefault();
    try {
      const response = await api.post("/courses", { code : code.toUpperCase(), title: title.toUpperCase(), preReqs : courses, cHours : cHours});
      errorRef.current.style.color = "green";
      setCode(""); 
      setTitle("");
      setCourses([]);
      setFetch(pre => !pre);
      setError(`Course added: ${response.data}`);
      setHours("");
    }
    catch (error) {
      errorRef.current.style.color = "red";
      if(error.status == 401){
          alert("Log In again. Your session has expired.")
          navigate("/signin", replace)
      }
      else if(error.response && error.response.data.detail) {
        setError(error.response.data.detail[0].msg);
      }
      else {
        setError("An error occured while sending your request");
      }
    }
  };

  return (
    <div className="course-page">
      <h2 className="dashboard-headings">
        Add New Course
      </h2>
    <form onSubmit={handleSubmit} className="add-course-main">
      <input
        type="text"
        placeholder="Course code"
        value={code}
        required
        onChange={e => setCode(e.target.value)}
      />
      <input
        type="text"
        placeholder="Course title"
        value={title}
        required
        onChange={e => setTitle(e.target.value)}
      />
      <input type="number" value={cHours} onChange={(e)=>setHours(e.target.value)} placeholder="Enter credit hours" required/>
      <select className="add-courselist" onChange={coursesHandler} defaultValue="">
        <option value="">Select Pre-requisites</option>
        {availablePreReqs.map((element) => <option value={element.code} key={element.code}>{`${element.code} - ${element.title}`}</option>)}
      </select>
      <button type="submit">Add Course</button>
    </form>
    <div className="course-error courseAdd-error" ref={errorRef}>{error}</div>
    <div className="selected-prereqs">
    <h2>Pre-Requisites: </h2>
    <ul id="prereqs-list">
      {courses.map((crsname)=> <li key={crsname.code} data-value={crsname.code}><span className="courseName">{`${crsname.code} - ${crsname.title}` }</span><span className="removeCourse" onClick={removeCourse}>-</span></li>)}
    </ul>
    </div>
    </div>
  );
}

export default AddCoursePage;
