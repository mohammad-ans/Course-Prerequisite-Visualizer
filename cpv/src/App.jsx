import { useState } from 'react'
import './App.css'
import About from './About'
import NavBar from './NavBar'
import {Link, Routes, Route, useLocation} from 'react-router-dom'
import Home from './Home'
import Footer from './Footer'
import SignIn from './SignIn'
import { DashboardAuthProvider } from "./useDashAuth.jsx"
import ListCoursesPage from './ListCoursePage'
import SearchCoursePage from './SearchCoursePage'
import CourseGraph from './Source'
import OTPForm from './Otp'
import { gsap } from 'gsap/gsap-core'
import Admin from './Admin.jsx'
import Degrees from './Degrees.jsx'
function App() {
    const [email, setEmail] = useState("");
    const loc = useLocation();
    const hidePaths = /\/admin/i;
    const hidePathBoolean =hidePaths.test(loc.pathname);
    function hoverEnter(e) {
        gsap.to(e.currentTarget.children[0], {
            width : "100%",
            duration : 0.5,
            overwrite : "auto"
        })
    }
    function hoverLeave(e) {
        gsap.to(e.currentTarget.children[0], {
            width : "0%",
            duration : 0.3,
            overwrite : "auto"
        })
    }
  return (
    <div className='navbar-helper'>
      {!hidePathBoolean && <div className="buttons-main">
        <button onMouseEnter={hoverEnter} onMouseLeave={hoverLeave}><span className="line-blue-main"></span><Link to="/">Student</Link></button>
        <button onMouseEnter={hoverEnter} onMouseLeave={hoverLeave}><span className="line-blue-main"></span><Link to="signin">Admin</Link></button>
      </div>
       }
  {!hidePathBoolean && <NavBar/>}
      <DashboardAuthProvider>
    <Routes>
      <Route path="/" element = {<Home/>}/>
      <Route path="/about" element={<About/>}/>
      <Route path="/signin" element={<SignIn setEmail = {setEmail}/>}/>
      <Route path="/otp" element={<OTPForm email={email}/>}/>
      {/* <Route path="/add" element={<DashboardAuthProvider><AddCoursePage/></DashboardAuthProvider>}/>
      <Route path="/bulkadd" element={<DashboardAuthProvider><BulkAddPrerequisitesPage/></DashboardAuthProvider>}/>
      <Route path="/delCourse" element={<DashboardAuthProvider><DeleteCoursePage/></DashboardAuthProvider>}/>
      <Route path="/listCourse" element={<DashboardAuthProvider><ListCoursesPage/></DashboardAuthProvider>}/>
      <Route path="/updateCourse" element={<DashboardAuthProvider><UpdateCoursePage/></DashboardAuthProvider>}/>
      <Route path="/add" element={<DashboardAuthProvider><AddCoursePage/></DashboardAuthProvider>}/> */}
      <Route path="/admin/*" element={<Admin/>}/>
      <Route path="/listCourse" element={<ListCoursesPage/>}/>
      <Route path="/search" element={<SearchCoursePage/>}/>
      <Route path="/graph" element={<CourseGraph/>}/>
      <Route path="/degrees" element={<Degrees/>}/>
    </Routes>
      </DashboardAuthProvider>
    {!hidePathBoolean && <Footer/>}
    </div>
  )
}

export default App
