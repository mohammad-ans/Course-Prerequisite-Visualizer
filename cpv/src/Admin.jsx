import { Routes, Route, useNavigate, replace, Link } from "react-router-dom"
import AddCoursePage from "./AdminPages/AddCourse"
import { useEffect } from "react"
import useDashAuth from "./useDashAuth"
import DeleteCoursePage from "./AdminPages/DeleteCourse";
import UpdateCoursePage from "./AdminPages/UpdateCourse";
import SuperUser from "./AdminPages/SuperUser";
import "./AdminPages/AddCourse.css"
import img from "./assets/default_img.png"
import Main from "./AdminPages/Main";
export default function Admin() {
    const { isAdmin, checking } = useDashAuth();
    const navigate = useNavigate();
    useEffect(() => {

        if (!checking)
            if (!isAdmin)
                navigate("/signin", replace)
    }, [checking])
    return (
        <div className="admin-area">
            <div className="dashboard-overlay">
            </div>
            <div className="dashboard-options">
                <Link to="/admin"><svg viewBox="0 0 24 24" fill="none"
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
                <img src={img} alt="ProfileIcon" />
                <div className="profile-hover"></div>
            </div>
            <Routes>
                <Route path="/" element={<Main/>}/>
                <Route path="/addcourse" element={<AddCoursePage />} />
                <Route path="/delcourse" element={<DeleteCoursePage />} />
                <Route path="/updatecourse" element={<UpdateCoursePage />} />
                <Route path="/superuser" element={<SuperUser />} />
            </Routes>
        </div>
    )
}