import { useEffect, useState } from "react";
import "./degree.css"
import Semester from "./Semester";
import api from "./api";

export default function Degrees() {
    const [degree, setDegree] = useState(localStorage.getItem("degree") || "");
    const [degrees, setDegrees] = useState([]);
    const [dname, setDname] = useState("");
    const [dtype, setType] = useState("");
    const [semData, setSemData] = useState([]);
    const [maxChours, setMaxchours] = useState("");
    const [dhours, setDhours] = useState("");
    const [overlay, setOverlay] = useState(true);
    const [error, setError] = useState("");
    async function degreeChange(e) {
        const dId = e.target.value;
        setDegree(dId);
        localStorage.setItem("degree", dId);
        getDegData(dId);
    }
    async function getDegData(dId) {
        if(dId == "")
            return;
        try{
            const response = await api.get(`/degree/${dId}`);
            setDname(response.data.dname);
            setDhours(response.data.dhours)
            setMaxchours(response.data.max_chours);
            setType(response.data.dtype);
            setSemData(response.data.semData);
        }
        catch(error) {
            setDegree("");
            localStorage.setItem("degree", "");
            setError("An error occured while fetching degree data");
        }
    }
    useEffect(()=>{
        async function getDegrees() {
            try{
                const response = await api.get("/degrees");
                setDegrees(response.data);
            }
            catch(error) {
                setError("An error occured while fetching degrees")
            }
        }
        getDegrees();
        getDegData(degree);
    }, [])
    function removeOverlay(e) {
        setOverlay(false);
    }
    return (
        <div className="degree-display">
            {overlay ?<><div className="degree-overlay"></div>
            <div className="degree-overlay-msg">
                <h3>Note: </h3>
                <ul>
                    <li>Select Degree, whose structure you want to see.</li>
                    <li>To see a course full details, click on the course. You will be navigated to search page, with details of that course.</li>
                </ul>
                <button onClick={removeOverlay}>Okay</button>
            </div></> : (<></>)}
            <h2>Degree Semester Wise Graph</h2>
            <select value={degree} onChange={degreeChange}>
                <option value="">Choose a Degree</option>
                {degrees.map(element => <option value={element.id} key={element.id}>{`${(element.dtype)} in ${element.dname}`}</option>)}
            </select>
            {degree != ""?(<><h3>{`${dtype} in ${dname}`}</h3>
            <ul className="degree-details">
                <li>{`Total Degree Credit hours: ${dhours}`}</li>
                <li>{`Max Allowed credit hours per semester: ${maxChours}`}</li>
                <li>{`Total Semesters : ${semData.length}`}</li>
            </ul>
            {/* <div className="show-prereqs-button">
                <p>Show Pre-requisite lines: </p>
                <span className="background">
                    <span className="circle"></span>
                </span>
            </div> */}
            <div className="degree-area">
                {semData.map(element => <Semester key={element.semNo} element={element}/>)}
            </div></>): (<></>)}
        </div>
    )
}