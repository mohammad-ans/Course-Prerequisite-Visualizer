import { useEffect, useState } from 'react'
import "./AddCourse.css"
import api from '../api'
import { useNavigate, replace } from 'react-router-dom';

function AddCoursePage() {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [orignalCourses, setOriginals] = useState([]);
  const [availablePreReqs, setAvailablePreReqs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  useEffect(()=>{
    async function func(){
      try{
        const response = await api.get("/courses");
        // const arr = response.data.map((element) => element.code + " - " + element.title);
        setOriginals(response.data);
        setAvailablePreReqs(response.data);
      }
      catch(e){
        setError("Error occured while fetching courses");
        console.error(e);
      }
    }
    func();
  }, [])

  function coursesHandler(e){
    const temp = e.target.value;
    if(temp === "")
      return;
    const tempObj = availablePreReqs.find(element => element.code == temp).title;
    setCourses(p => [...courses, {code : temp, title : tempObj}]);
    setAvailablePreReqs(p => p.filter((element) => element.code != temp));
    document.querySelector(".add-courselist").options.selectedIndex = 0;
  }

  function removeCourse(e) {
    const course = e.currentTarget.parentNode.dataset.value;
      setAvailablePreReqs([...availablePreReqs, {code : course, title : courses.find(element => element.code == course).title}]);
      setCourses(p => p.filter((el)=> el.code != course));
  }
  async function handleSubmit(e){
    e.preventDefault();
    try {
      const response = await api.post("/courses", { code : code.toUpperCase(), title: title.toUpperCase(), preReqs : courses});
      console.log("Course added:", response.data);
      let arr = [...orignalCourses, {code : title}];
      setOriginals(arr);
      setCode(""); 
      setTitle("");
      setCourses([]);
      setAvailablePreReqs(arr);
      setError("");
    }
    catch (error) {
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
      <select className="add-courselist" onChange={coursesHandler} defaultValue="">
        <option value="">Select Pre-requisites</option>
        {availablePreReqs.map((element) => <option value={element.code} key={element.code}>{`${element.code} - ${element.title}`}</option>)}
        <option value="a - Hi">Hi</option>
        <option value="b - Ci">Ci</option>
        <option value="c - Bi">Bi</option>
      </select>
      <button type="submit">Add Course</button>
    </form>
    <div className="course-error courseAdd-error">{error}</div>
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
