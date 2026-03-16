import "./NavBar.css"
import {Link} from 'react-router-dom'
import logo from "./assets/LogoC.png"
import {gsap} from "gsap"
import { useState } from "react"
export default function NavBar() {
    const [navOpen, setnavOpen] = useState(false);
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
    function func(e) {
        const el = document.querySelector(".nav");
        if(window.innerWidth <=1000) {
            if(navOpen){
                el.classList.add("nav-close");
                el.classList.remove("nav-open");
                gsap.to(".line-1", {
                    rotate: "0deg",
                    top : "0px",
                    duration : 0.1,
                    ease: "sine.inOut"
                })
                gsap.to(".line-2", {
                    rotate: "0deg",
                    bottom : "0px",
                    duration : 0.2,
                    ease: "sine.inOut"
                })
                document.querySelector(".line-remove").style.display = "inline"
                // gsap.to(".line-remove", {
                //     display : "inline"
                // })
            }else{
                el.classList.add("nav-open");
                el.classList.remove("nav-close");
                document.querySelector(".line-remove").style.display = "none"
                // gsap.to(".line-remove", {
                //     display : "none"
                // });
                gsap.to(".line-1", {
                    rotate: "-45deg",
                    top: "3px",
                    duration : 0.1,
                    ease: "sine.inOut"
                });
                gsap.to(".line-2", {
                    rotate: "-135deg",
                    bottom : "3px",
                    duration : 0.2,
                    ease: "sine.inOut"
                });
            }
            setnavOpen(n => !n);
        }
    }
    function navCloseOnNavigation() {
        func()
    }
    return(
        <div className="nav-close nav" >
            <nav className="main-nav">
                <Link to="/" className="logo"><img src={logo} alt="C"/><span className="logo-span">Cpv.com</span></Link>
                <ul className="nav-list">
                    <li onMouseEnter={hoverEnter} onMouseLeave={hoverLeave} onClick={navCloseOnNavigation}><span className="line-blue"></span><Link to="/about">About</Link></li>
                    <li onMouseEnter={hoverEnter} onMouseLeave={hoverLeave} onClick={navCloseOnNavigation}><span className="line-blue"></span><Link to="/graph">Prerequisite Graph</Link></li>
                    <li onMouseEnter={hoverEnter} onMouseLeave={hoverLeave} onClick={navCloseOnNavigation}><span className="line-blue"></span><Link to="/degrees">Degrees</Link></li>
                </ul>
                <div className="nav-buttons">
                    <button className="nav-button-1">Get in Touch</button>
                    <Link to="/search"><button className="nav-button-2">Search Courses</button></Link>
                    <div className="hamburger" onClick={func}>
                        <div className="line-1"></div>
                        <div className="line-remove"></div>
                        <div className="line-2"></div>
                    </div>
                </div>
            </nav>
        </div>
    )
}