import { useEffect, useRef, useState } from "react";
import api from "../api";
import "./AddCourse.css"
import useDashAuth from "../useDashAuth";
export default function DelCourseDegree() {
    const [courseCode, setCode] = useState("");
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState("");
    const errorRef = useRef();
    const [degreeId, setId] = useState("");
    const [option, setOption] = useState(false);
    const [degrees, setDegrees] = useState([]);
    
    const {checking, isAdmin, setIsAdmin} = useDashAuth();

    useEffect(()=>{
        if(!checking)
            if(!isAdmin)
                navigate("/signin");
    }, [checking])

    useEffect(()=>{
        async function getCourses(){
            try{
                const response = await api.get("/courses")
                setCourses(response.data);
            }
            catch(error) {
                errorRef.current.style.color = "red";
                if(error.response.data && error.response.data.detail) {
                    setError(error.response.data.detail[0].msg);
                }
                else {
                    setError("An error occured while fetching the courses.")
                }
            }
        }
        getCourses();
    }, [])

    async function getDegrees(temp) {
        try{
            const response = await api.get(`/cdegrees/${temp}`);
            setDegrees(response.data);
        }
        catch(error) {
            
            errorRef.current.style.color = "red";
            if(error.response.data && error.response.data.detail) {
                setError(error.response.data.detail[0].msg);
            }
            else {
                setError("An error occured while getting degrees.");
            }
            setDegrees([]);
        }
    }

    async function formSubmit(e) {
        e.preventDefault();
        try{
            const response = await api.post("/delsemester/courses", {
                "degreeId" : degreeId == "" ? 0 : degreeId,
                "courseCode" : courseCode,
                "option" : option
            });
            errorRef.current.style.color = "green";
            setError("Course deleted from semester");
            setCode("");
            setDegrees([]);
        }
        catch(error) {
            errorRef.current.style.color = "red";
            if(error.status == 401){
                alert("Log In again. Your session has expired.");
                navigate("/signin", replace);
                setIsAdmin(false);
            }
            else if(error.response.data && error.response.data.detail) {
                setError(error.response.data.detail[0].msg);
            }
            else {
                setError("Course could not be deleted.")
            }
        }
    }
    function codeChange(e) {
        const temp = e.target.value;
        setCode(temp);
        getDegrees(temp);
    }
    function degreeChange(e) {
        const temp = e.target.value;
        setId(temp);
        
    }
    return(
    <div className="course-page">
        <h2 className="dashboard-headings">
            Delete Course From A Degree
        </h2>
        <form className="add-course-main" onSubmit={formSubmit}>
            <input type="text" value={courseCode} onChange={codeChange} required placeholder="Enter Course Code"/>
            <select value={courseCode} onChange={codeChange}>
                <option value="">Select Course From List</option>
                {courses.map(element => <option key={element.code} value={element.code}>{`${element.code} - ${element.title}`}</option>)}
            </select>
            <div className="update-name">
            <div>
            <input type="checkbox" value={option} onChange={() => setOption(pre => !pre)}/>
            <span>Delete From all Degrees</span>
            </div>
            <select value={degreeId} onChange={degreeChange} disabled={option}>
                <option value="">Select a Degree</option>
                {degrees.map(element => <option value={element.degreeId} key={element.degreeId}>{`${element.dtype} in ${element.dname}--Semester No. ${element.semNo}`}</option>)}
            </select>
            </div>
            <button type="submit">Delete Course</button>
        </form>
        <div className="course-error" ref={errorRef}>{error}</div>
    </div>
    )
}