import { useEffect, useRef, useState } from "react"
import api from "./api";
import "./Chatbot.css"
import {gsap} from "gsap/gsap-core"
export default function Chatbot() {
    const [degree, setDegree] = useState("");
    const [degrees, setDegrees] = useState([]);
    const [loading, setLoading] = useState(false);
    const textRef = useRef();
    const messageArea = useRef();
    useEffect(()=>{
        async function getDegrees() {
            try{
                const response = await api.get("/degrees");
                setDegrees(response.data);
            }
            catch(error) {
    
            }
        }
        getDegrees();
    },[])
    function degreeChange(e) {
        setDegree(e.target.value);
    }
    function textAreaFocus(e) {
        const element = e.currentTarget.parentNode;
        if(element)
            element.style.border = "1px solid rgb(114, 114, 114)"
    }
    
    function textAreaBlur(e) {
        const element = e.currentTarget.parentNode;
        if(element)
            element.style.border = "1px solid rgb(47, 47, 47)"
    }
    async function sendRequest(e) {
        e.preventDefault();
        let response, err, animation, element;
        try{
            const request = textRef.current.value;
            element = document.createElement("p");
            element.classList.add("request-msg");
            element.innerText = request;
            messageArea.current.append(element);
            messageArea.current.scrollTop = messageArea.current.scrollHeight;
            textRef.current.value = "";
            element = document.createElement("p");
            element.classList.add("dot");
            animation = gsap.to(element, {
                transform : "scale(1, 1)",
                duration : 0.6,
                repeat : -1,
                yoyo : true,
                ease : "sine",
                yoyoEase : "sine"
            })
            messageArea.current.append(element);
            response = await api.post("/ai", {
                "question" : request,
                "degreeId" : degree
            })
        }
        catch(error) {
            if(error.response && error.response.data.detail) {
                err = error.response.data.detail[0].msg;
            }
            else{
                err = "Error processing request. Refresh and try again. If error presists feel free to contact us";
            }
        }
        finally{
            animation.revert();
            element.classList.remove("dot");
            if(err){
                element.classList.add("response-msg", "error-msg");
                element.innerText = err;
            }
            else{
                element.classList.add("response-msg");
                element.innerText = response.data;
            }
            setLoading(pre => !pre);
        }
    }
    function keySupport(e) {
        if(e.keyCode == 13 && !e.shiftKey){
            e.preventDefault();
            e.target.form.requestSubmit();
         }
        if(e.keyCode == 27)
            e.currentTarget.blur();
    }
    
    return(
        <div className="chatbot">
            <div className="message-area" ref={messageArea}>
                <p className="response-msg">Hi, I'm CPV AI. You can ask me any questions related to structure of degrees, courses and pre-requisites. Make sure you have selected the correct degree, before asking a question. In case of any problem, please referesh the page. If error persists feel free to inform us. I'm abit slow but I work😊😊.
                </p>
            </div>
            <form className="typearea" onSubmit={sendRequest}>
                <select value={degree} onChange={degreeChange} onFocus={textAreaFocus} onBlur={textAreaBlur} required>
                    <option value="">Select a Degree</option>
                    {
                        degrees.map(element => <option key={element.id} value={element.id}>{`${element.dtype} in ${element.dname}`}</option>)
                    }
                </select>
                <textarea onFocus={textAreaFocus} onBlur={textAreaBlur} placeholder="Type Here" ref={textRef} onKeyDown={keySupport} required/>
                <button type="submit" className="send-request">
                    <svg className="sendsvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 21L23 12L2 3L6 12L2 21Z" /><path d="M6 12L23 12" /></svg>
                </button>
            </form>
        </div>
    )
}