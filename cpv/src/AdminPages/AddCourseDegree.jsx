import { useEffect, useRef, useState } from "react";
import api from "../api";
import useDashAuth from "../useDashAuth";

export default function AddCourseDegree() {
    const [type, setType] = useState("");
    const [degree, setDegree] = useState("");
    const [semNo, setSemNo] = useState("");
    const [code, setCode] = useState("");
    const [degrees, setDegrees] = useState([]);
    const [error, setError] = useState("");
    const errorRef = useRef();
    const [maxSem, setMaxSem] = useState("");
    const [courses, setCourses] = useState([]);
    const [fetchCourses, setFetchCourses] = useState(false);
    const {checking, isAdmin, setIsAdmin} = useDashAuth();

    useEffect(()=>{
        if(!checking)
            if(!isAdmin)
                navigate("/signin");
    }, [checking])

    useEffect(()=>{
        async function getCourses() {
            try{
                const response = await api.get("/courses/full");
                setCourses(response.data);
            }
            catch(error) {
                errorRef.current.style.color = "red";
                if(error.response.data && error.response.data.detail) {
                setError(error.response.data.detail[0].msg);
                }
                else {
                setError("An error occured while sending your request");
                }
            }
        }
        getCourses();
    },[fetchCourses])
    async function formSubmit(e) {
        e.preventDefault();
        try{
            const tempCourse = courses.filter(element => element.code == code)[0];
            const tempDegree = degrees.filter(element => element.id == degree)[0];
            const totalHours = tempDegree.d_chours + tempCourse.cHours;
            if (totalHours > tempDegree.d_maxchours){
                errorRef.current.style.color = "red";
                setError("Adding this course exceeds the max credit hours for this degree");
                return;
            }
            const response = await api.post("/semester/courses", {
                "semNo" : semNo,
                "degreeId" : degree,
                "courseCode" : code,
                "courseHours" : tempCourse.cHours
            })
            errorRef.current.style.color = "green";
            setError("Course Successfully added");
            setCode("");
            setDegree("");
            setType("");
            setSemNo("");
            setDegrees([]);
        }
        catch(error){
            errorRef.current.style.color = "red";
            if(error.status == 401){
                alert("Log In again. Your session has expired.");
                navigate("/signin", replace);
                setIsAdmin(false);
            }
            else if(error.response && error.response.data.detail[0]) {
                setError(error.response.data.detail[0].msg)
            }
            else{
                setError("Error while adding the course")
            }
        }
        finally{
            setFetchCourses(pre => !pre);
        }
    }
    async function setDegreeType(e) {
        setType(e.target.value);
        if(e.target.value == ""){
            setDegrees([]);
            setError("");
            return;
        }
        try{
            const response = await api.get(`/tdegrees/${e.target.value}`);
            setDegrees(response.data);
            setError("");
        }
        catch(error) {
            errorRef.current.style.color = "red";
            if(error.response && error.response.data.detail) {
                setError(error.response.data.detail[0].msg);
            }
            else{
                setError("An error occured while fetching degrees.")
            }
        }
    }
    function degreeChange(e) {
        setDegree(e.target.value);
        const tempDegree = degrees.filter(element => element.id == e.target.value);
        setMaxSem(tempDegree[0].years * 2)
    }
    function selectCodeChange(e) {
        setCode(e.target.value);
    }
    return(
        <div className="course-page">
            <h2 className="dashboard-headings">
                Add Course to a Degree
            </h2>
            <form className="add-course-main" onSubmit={formSubmit}>
                <input type="text" value={code} placeholder="Enter Course Code" onChange={(e) => setCode(e.target.value)}/>
                <select value={code} onChange={(e) => setCode(e.target.value)}>
                    <option value="">Select Course From List</option>
                    {courses.map(element => <option value={element.code} key={element.code} >{`${element.code} - ${element.title} (${element.cHours} CH)`}</option>)}
                </select>
                <select value={type} onChange={setDegreeType} required>
                    <option value="">Select Degree Type</option>
                    <option value="Bachelors">Bachelors Level</option>
                    <option value="Masters">Masters Level</option>
                </select>
                <select value={degree} onChange={degreeChange} required>
                    <option value="">Select a Degree</option>
                    {degrees.map(element=> <option value={element.id} key={element.id}>{element.dname}</option>)}
                </select>
                <input type="number" min={0} max={maxSem == "" ? 8 : maxSem } value={semNo} onChange={(e) => setSemNo(e.target.value)} placeholder="Enter Semester Number" required/>
                <button type="submit">Add Course</button>
            </form>
                <div className="course-error" ref={errorRef}>{error}</div>
        </div>
    )
}