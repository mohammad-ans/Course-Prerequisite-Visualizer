import "./Footer.css"
import {Link} from 'react-router-dom'
import logo from "./assets/LogoC.png"
export default function Footer() {
    return(
        <footer>
            <div className="footer-flex-container"><div className="footer-logo"><Link to="/" className="logo"><img src={logo} alt="C"/><span className="logo-span">Cpv.com</span></Link></div>
            <div className="footer-description">Where your paths become clear</div>
            </div>
            <div className="footer-columns">
            <div className="social-media">
                <p>Connect</p>
                <a href="www.facebook.com">Facebook</a>
                <a href="www.instagram.com">Instagram</a>
                <a href="www.github.com">Github</a>
            </div>
            <div className="get-in-touch">
                <Link to="/contactus">Get in Touch</Link>
            </div>
            </div>
            <div className="copyright">&copy; 2025 Your Company Name. All Rights Reserved.</div>
        </footer>
    )
}