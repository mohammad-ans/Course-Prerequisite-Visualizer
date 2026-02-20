import { Routes, Route, useNavigate, replace } from "react-router-dom"
import AddCoursePage from "./AdminPages/AddCourse"
import { useEffect } from "react"
import useDashAuth from "./useDashAuth"
import DeleteCoursePage from "./AdminPages/DeleteCourse";
import UpdateCoursePage from "./AdminPages/UpdateCourse";
import SuperUser from "./AdminPages/SuperUser";
import "./AdminPages/AddCourse.css"

export default function Admin() {
    const {isAdmin, checking} = useDashAuth();
    const navigate = useNavigate();
    useEffect(()=>{

        if(!checking)
            if(!isAdmin)    
                navigate("/signin", replace)
    }, [checking])
    return(
        <div className="admin-area">
        <Routes>
            {/* <Route path="/"></Route> */}
            <Route path="/addcourse" element={<AddCoursePage/>}/>
            <Route path="/delcourse" element={<DeleteCoursePage/>}/>
            <Route path="/updatecourse" element={<UpdateCoursePage/>}/>
            <Route path="/superuser" element={<SuperUser/>}/>
        </Routes>
        </div>
    )
}