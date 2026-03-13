import { Routes, Route, useNavigate, replace, Link, useLocation } from "react-router-dom"
import AddCoursePage from "./AdminPages/AddCourse"
import logo from "./assets/LogoC.png"
import { useEffect, useState } from "react"
import useDashAuth from "./useDashAuth"
import DeleteCoursePage from "./AdminPages/DeleteCourse";
import UpdateCoursePage from "./AdminPages/UpdateCourse";
import SuperUser from "./AdminPages/SuperUser";
import "./AdminPages/AddCourse.css"
import img from "./assets/default_img.png"
import Main from "./AdminPages/Main";
import api from "./api";
import AddDegree from "./AdminPages/AddDegree";
import AddCourseDegree from "./AdminPages/AddCourseDegree";
import DelCourseDegree from "./AdminPages/DelCourseDegree"
export default function Admin() {
    const { isAdmin, checking, username } = useDashAuth();
    const [hover, setHover] = useState(false);
    const location = useLocation().pathname.toLowerCase() == "/admin";
    
    const navigate = useNavigate();
    useEffect(() => {

        if (!checking)
            if (!isAdmin)
                navigate("/signin", replace)
    }, [checking])

    async function logout() {
        try{
            const response = await api.get("/logout");
        }
        catch(e){
            alert("Log In again. You are logged out.")
            navigate("/signin", replace)
        }
    }
    return (
        <div className="admin-area">
            <div className="dashboard-overlay">
            </div>
            <div className="dashboard-options">
                <div className="left-side">
                <Link to="/admin" aria-label="Admin-dashboard" title="Admin-dashboard"><svg viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 10.5L10.8 4.8C11.5 4.2 12.5 4.2 13.2 4.8L20 10.5
           V19C20 20.1 19.1 21 18 21H14
           V15.5C14 14.7 13.3 14 12 14
           C10.7 14 10 14.7 10 15.5V21H6
           C4.9 21 4 20.1 4 19V10.5Z"
                        strokeWidth="2"
                        stroke="rgb(75, 79, 75)"
                        strokeLinecap="round"
                        strokeLinejoin="round" />
                </svg>
                </Link>
                {location && <Link to="/" className="nav-logo"><img src={logo} alt="" /><h2>Cpv.com</h2></Link>}
               </div> 
            <div className="dashboard-options-right">
                
                <button className="logout-button" onClick={logout}>Log out</button>
                <div className="profile-hover">
                        <img src={img} alt="ProfileIcon" />
                        <svg onClick={()=>setHover(pre => !pre)} fill="rgb(150, 150, 150)" viewBox="-6.5 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <title>dropdown</title>
                        <path d="M18.813 11.406l-7.906 9.906c-0.75 0.906-1.906 0.906-2.625 0l-7.906-9.906c-0.75-0.938-0.375-1.656 0.781-1.656h16.875c1.188 0 1.531 0.719 0.781 1.656z"></path>
                        </svg>
                        {hover && <p>{username}</p>}
                </div>
            </div>
            </div>
            <Routes>
                <Route path="/" element={<Main/>}/>
                <Route path="/addcourse" element={<AddCoursePage />} />
                <Route path="/delcourse" element={<DeleteCoursePage />} />
                <Route path="/updatecourse" element={<UpdateCoursePage />} />
                <Route path="/superuser" element={<SuperUser />} />
                <Route path="/degreeadd" element={<AddDegree />} />
                <Route path="/coursedegree" element={<AddCourseDegree/>}/>
                <Route path="/del/coursedegree" element={<DelCourseDegree/>}/>
            </Routes>
        </div>
    )
}