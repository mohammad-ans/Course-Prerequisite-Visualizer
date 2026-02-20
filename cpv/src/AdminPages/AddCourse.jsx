import { useEffect, useState } from 'react'
import "./AddCourse.css"
import api from '../api'

function AddCoursePage() {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [orignalCourses, setOriginals] = useState([]);
  const [availablePreReqs, setAvailablePreReqs] = useState([]);
  const [courses, setCourses] = useState([]);
  
  useEffect(()=>{
    async function func(){
      try{
        const response = await api.get("/courses");
        const arr = response.data.map((element) => element.code + " - " + element.title);
        setOriginals(arr);
        setAvailablePreReqs(arr);
      }
      catch(e){
        console.error(e);
      }
    }
    func();
  }, [])

  function coursesHandler(e){
    const temp = e.target.value;
    if(temp === "")
      return;
    setCourses(p => p.includes(temp)? p : [...courses, temp]);
    setAvailablePreReqs(p => p.filter((element)=>element!=temp));
    document.querySelector(".add-courselist").options.selectedIndex = 0;
  }

  function removeCourse(e) {
    const course = e.currentTarget.parentNode.childNodes[0].innerText;
    if(courses.includes(course)){
      setCourses(p => p.filter((el)=>el!=course));
      setAvailablePreReqs([...availablePreReqs, course]);
    }
  }
  async function handleSubmit(e){
    e.preventDefault();
    try {
      const response = await api.post("/courses", { code : code.toUpperCase(), title: title.toUpperCase(), preReqs : courses});
      console.log("Course added:", response.data);
      let arr = [...orignalCourses, code + " - " + title];
      console.log(arr);
      setOriginals(arr);
      setCode(""); 
      setTitle("");
      setCourses([]);
      setAvailablePreReqs(arr);
      document.querySelector(".courseAdd-error").innerHTML = "";
    }
    catch (error) {
      const element = document.querySelector(".courseAdd-error");
      if(error.response.data.detail)
        element.innerHTML = error.response.data.detail[0].msg;
      else
        element.innerHTML = "An error occured while sending your request";
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
        {availablePreReqs.map((element) => <option value={element} key={element}>{element}</option>)}
        <option value="a - Hi">Hi</option>
        <option value="b - Ci">Ci</option>
        <option value="c - Bi">Bi</option>
      </select>
      <button type="submit">Add Course</button>
    </form>
    <div className="course-error courseAdd-error"></div>
    <div className="selected-prereqs">
    <h2>Pre-Requisites: </h2>
    <ul id="prereqs-list">
      {courses.map((crsname)=> <li key={crsname}><span className="courseName">{crsname}</span><span className="removeCourse" onClick={removeCourse}>-</span></li>)}
    </ul>
    </div>
    </div>
  );
}

export default AddCoursePage;
