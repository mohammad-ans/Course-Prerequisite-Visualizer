import { useEffect, useRef } from "react";
import "./Contactus.css"
export default function ContactUs() {
    const timeoutRef = useRef();
    async function copy(e) {
        const text = e.target.innerText;
        const svg = e.target.children[0];
        try{
            await navigator.clipboard.writeText(text);
            svg.style.opacity = "1";
            timeoutRef.current = setTimeout(() => svg.style.opacity="0", 4000);
        }
        catch(er){
        }
    }
    useEffect(()=>{
        return () => {
            if (timeoutRef.current)
                clearTimeout(timeoutRef.current);
        }
    }, [])
    return(
        <div className="contact-us">
            <h2>Email: </h2>
            <p className="email" onClick={copy}>ghost@gmail.com 
<svg width="22px" height="22px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.89163 13.2687L9.16582 17.5427L18.7085 8" stroke="#00ff00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg></p>
            <h2>Phone No: </h2>
            <p onClick={copy}>(207) 667-5911 
<svg width="22px" height="22px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.89163 13.2687L9.16582 17.5427L18.7085 8" stroke="#00ff00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg></p>
            <p className="message">Email us or give us a call at the helpline, we will try our best to resolve your issue.</p>
            <p className="message">Click on email or phone number to copy them.</p>
        </div>
    )
}