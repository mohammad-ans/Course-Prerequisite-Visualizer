import { useEffect, useState } from "react"
import api from "../api";


export default function AddDegree() {
    const [dname, setName] = useState("");
    const [dtype, setType] = useState("");
    const [dHours, setHours] = useState("");
    const [maxHours, setMaxHours] = useState("");
    const [years, setYears] = useState("");
    const [error, setError] = useState("");
    useEffect(()=>{
        async function getDegrees(){

        }
    }, [])
    async function addDegree(e){
        e.preventDefault();
        if (dtype == "") {
            setError("Select a type");
            return
        }
        try{
            const response = await api.post("/degree", {
                "dname" : dname,
                "dtype" : dtype,
                "d_maxchours" : dHours,
                "max_chours" : maxHours,
                "years" : years
            })
            console.log(response.data)
            setError("");
        }
        catch(e){
            console.log(e);
            setError("Course Not Added");
        }
        finally{
            setHours("");
            setMaxHours("");
            setName("");
            setYears("");
            setType("");
        }
    }
    return(
    <div className="course-page">
        <h2 className="dashboard-headings">Add Degree Program</h2>
        <form className="add-course-main" onSubmit={addDegree}>
            <input type="text" placeholder="Enter Degree Name" value={dname} onChange={(e)=> setName(e.target.value)} required/>
            <select value={dtype} onChange={(e) => setType(e.target.value)}>
                <option value="">Select degree type</option>
                <option value="bachelors">Bachelors</option>
                <option value="masters">Masters</option>
            </select>
            <input type="number" placeholder="Enter degree credit hours" value={dHours} onChange={(e) => setHours(e.target.value)} required/>
            <input type="number" placeholder="Enter degree max credit hours per semester" value={maxHours} onChange={(e) => setMaxHours(e.target.value)} required/>
            <input type="number" placeholder="Enter total years in degree" value={years} onChange={(e) => setYears(e.target.value)} required/>
            <button type="submit" >Add Degree Program</button>
        </form>
        <div className="course-error">{error}</div>
    </div>
    )
}