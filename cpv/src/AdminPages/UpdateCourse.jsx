import { useEffect, useRef, useState } from 'react';
import api from '../api';
import { useNavigate, replace } from "react-router-dom";
import useDashAuth from '../useDashAuth';

export default function UpdateCoursePage() {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [courses, setCourses] = useState([]);
  const selectElement = useRef();
  const [nameOption, setOption] = useState(false);
  const [error, setError] = useState("");
  const errorRef = useRef();
  const [availablePreReqs, setAvailablePreReqs] = useState([]);
  const [preReqCourses, setpreReqs] = useState([]);
  const [cHours, setHours] = useState("");
  const [hoursOption, setHoursOpt] = useState(false);
  const [getData, setGetdata] = useState(false);
  const navigate = useNavigate();
  // const [selectedPreReq, setSelectPr] = useState("")
  useEffect(()=>{
    async function getCourses() {
      try{
        const response = await api.get("/courses/full");
        setCourses(response.data);
        setError("");
      }
      catch(error){
        errorRef.current.style.color = "red";
        if(error.status == 401){
            alert("Log In again. Your session has expired.")
            navigate("/signin", replace)
        }
        if(error.response.data && error.response.data.detail) {
          setError(error.response.data.detail[0].msg);
        }
        else{
          setError("An error occured while getting courses. Referesh Page.");
        }
      }
    }
    getCourses();

  }, [getData])
  useEffect(()=>{
    
    async function getPreReqs() {
      if(code=="")
        return;
      try{
        const response = await api.get(`/preReqs/${code}`);
        let arr = [];
        for(let i = 0; i < courses.length; i++){
          if( (!response.data.some(element=> element.code == courses[i].code)) && courses[i].code != code){
            arr.push(courses[i]);
          }
        }
        setpreReqs(pre => response.data);
        setAvailablePreReqs(pre => arr)
      }
      catch(error) {
        errorRef.current.style.color = "red";
        if(error.status == 401){
          alert("Log In again. Your session has expired.")
          navigate("/signin", replace)
      }
      if(error.response.data && error.response.data.detail) {
        setError(error.response.data.detail[0].msg);
      }
      else{
        setError("An error occured while trying to fetch pre-requisites. Referesh page")
      }
      }
    }
    getPreReqs();
  }, [code])

  async function handleUpdate(e){
    e.preventDefault();
    if(!courses.find((element)=>element.code == code)){
      errorRef.current.style.color = "red";
      setError("Course does not exists yet. Add course first");
      return;
    }
    try {
      const response = await api.put(`/courses/${code}`, {"code" : code, "title" : title, "preReqs" : preReqCourses, cHours : cHours});
      errorRef.current.style.color = "green";
      setError(`Course Updated: ${response.data}`);
      setCode("");
      setTitle("");
      setHours("");
      setAvailablePreReqs([]);
      setpreReqs([]);
      setGetdata(pre => !pre);
    } 
    catch (error) {

      errorRef.current.style.color = "red";

      if(error.status == 401){
          alert("Log In again. Your session has expired.")
          navigate("/signin", replace)
      }
      if(error.response.data && error.response.data.detail) {
        setError(error.response.data.detail[0].msg);
      }
      else{
        setError("Error updating the course")
      }
    }
  };
  function selectAndCodeChangeHandler(e){
    const val = e.currentTarget.value;
    setCode(val);
    if(!nameOption){
      const temp = courses.filter((element)=>element.code==val);
      if(temp.length >= 1){
        setTitle(temp[0].title);
        setHours(temp[0].cHours);
        return;
      }
      setTitle("");
      setHours("");
    }
  }
  function optionChangeHandler(e) {
    if(nameOption && selectElement.current){
      const val = selectElement.current.value;
      if(val == "") {
        setTitle("");
      }
    else{
      const temp = courses.filter((element)=>element.code == val);
      if(temp.length >= 1)
        setTitle(temp[0].title);
      else
        setTitle("");
    }
    }
    setOption(pre=>!pre);
  }
  function choursOption(e) {
    if(hoursOption && selectElement.current) {
      const val = selectElement.current.value;
      if(val == "")
        setHours("");
      else{
        const temp = courses.filter((element) => element.code == val);
        if(temp.length >= 1)
          setHours(temp[0].cHours);
        else
          setHours("");
      }
    }
    console.log(hoursOption);
    setHoursOpt(pre => !pre);
  }
  function removeCourse(e) {
    const temp = e.currentTarget.parentNode.dataset.value;
    setpreReqs(pre => pre.filter((element) => element.code != temp));
    const val = temp.split(" - ");
    setAvailablePreReqs([...availablePreReqs, {"code" : val[0], "title" : val[1]}]);
  }
  function changePreReqHandler(e) {
    let temp = e.currentTarget.value;
    setpreReqs([...preReqCourses, {code : temp, title : availablePreReqs.find(element => element.code == temp).title}]);
    setAvailablePreReqs(pre => pre.filter((element) => element.code != temp));
  }
  return (
    <div className="course-page">
      <h2 className="dashboard-headings">
        Update Course
      </h2>
    <form onSubmit={handleUpdate} className="add-course-main">

      <input type="text" placeholder="Existing course code" value={code} onChange={selectAndCodeChangeHandler}/>

      <select className="add-courselist" ref={selectElement} value={code} onChange={selectAndCodeChangeHandler}>
        <option value="">Select Course From List</option>
        {courses.map((element)=><option key={element.code} value={element.code}>{`${element.code} - ${element.title}`}</option>)}
      </select>
      
      <div className="update-name">
      <input
        type="text"
        placeholder="New course title"
        value={title}
        onChange={e => setTitle(e.currentTarget.value)}
        disabled={!nameOption}
      />
      <div>
        <input type="checkbox" value={nameOption} onChange={optionChangeHandler}/>
        <span>Update Course Name</span>
        </div>
        <input type="number" placeholder="New Credit Hours" value={cHours} disabled={!hoursOption} onChange={(e)=> setHours(e.target.value)}/>
        <div>
          <input type="checkbox" value={hoursOption} onChange={choursOption}/>
          <span>Update Credit Hours</span>
        </div>
      </div>
      <div>
        <select className="add-courselist" value="" onChange={changePreReqHandler}>
          <option value="">Select Pre-requisites</option>
          {availablePreReqs.map((element)=><option value={element.code} key={element.code}>{`${element.code} - ${element.title}`}</option>)}
        </select>
      </div>
      <button type="submit">Update Course</button>
    </form>
    <div className="course-error courseUpdate-error" ref={errorRef}>{error}</div>
      <div className="selected-prereqs">
        <h2>Pre-Requisites: </h2>
        <ul id="prereqs-list">
          {preReqCourses.map((element)=><li key={element.code} data-value={element.code}><span className="courseName">{`${element.code} - ${element.title}`}</span><span className="removeCourse" onClick={removeCourse}>-</span></li>)}
        </ul>
      </div>

        </div>
  );
}