import {useState, useEffect} from "react"
import { Link, useNavigate } from "react-router-dom"
import "./SignIn.css"
import api from "./api";
import useDashAuth from "./useDashAuth";

export default function SignIn(props) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] =  useState("");
    const {isAdmin} = useDashAuth();
    const {checking} = useDashAuth();
    const navigate = useNavigate();

    useEffect(()=>{
        if(!checking && isAdmin) {
            navigate("/admin")
        }
    }, [checking])
    async function sendOtp(e){
        setLoading(true);
        e.preventDefault()
        try{
            const resp = await api.post("/signin", {
                email: email
            })
            if (resp.data.msg == "Success"){
                props.setEmail(email);
                navigate("/otp");
                setError("");
            }
            else{
                setError(resp.data.message);
            }
        }
        catch(exception){
            if (exception.response && exception.response.data){
                setError(exception.response.data.detail[0].msg);
            }
            else
                setError("Something went wrong. Try Again");
        }
        finally{
            setLoading(false);
        }
    }
    return (
        <div className="background-signin">
        <form onSubmit={sendOtp} className="sign-form">
            <div className="signin-up">
                <h2 className="signin-up-heading">Sign In</h2>
                <p className="signin-up-p">Enter the email assigned by admin.</p>
                <hr />
            </div>
        <ul className="signin-list">
            <li>
                <label>
                    Enter your email
                </label>
                <div className="signform-input">                    
                <input className="email-input"type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required>
                </input>
                </div>
        </li>

        <li>
        <button className="sign-button" type="submit" disabled={loading} >{loading ? "Processing...":"Send OTP"}</button></li>
        </ul>
        </form>
        {error == "" ? <></> : <div className="error">{error}</div>}
        </div>
    )
}