import { useEffect, useState } from "react"
import useDashAuth from "../useDashAuth"
import "./AddCourse.css"
import DashboardBox from "./DashboardBox"

export default function Main(){
    const [data, setData] = useState(["Add Course", "Delete Course", "Update Course", "Add Degree", "Add Course to Degree","Delete Course From Degree", "See Pre-requisite Graph"]);
    const [links, setLinks] = useState(["addcourse", "delcourse", "updatecourse","degreeadd", "coursedegree", "del/coursedegree", "/graph"]);
    const {isAdmin, checking, setChecking} = useDashAuth();
    useEffect(()=>{
        if(!checking) {
            if(isAdmin == "admin"){
                setLinks(pre=> [...pre, "/admin/superuser"]);
                setData(pre=>[...pre, "Manage Users"])
            }
        }
    }, [checking, isAdmin])
    return(
        <div>
            <h1 className="dashboard-main-heading">Welcome to Admin Dashboard</h1>
            <div className="dashboard-boxes">
                {data.map((element, index)=><DashboardBox name={element} key={element} link={links[index]}/>)}
             </div>
        </div>
    )
}