import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import "./otpform.css"
import api from "./api";
import useDashAuth from "./useDashAuth";


export default function OTPForm(props) {
    const {setIsAdmin} = useDashAuth();
    const {isAdmin} = useDashAuth();
    const {setUsername} = useDashAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    useEffect(()=>{
        if(isAdmin) {
            navigate("/admin")
        }
        document.querySelector(".otp-enter-design").focus()
    }, [])
    async function otpVerification(otp) {
        try {
            const response = await api.post("acc-verify", {
                email: props.email,
                otp: otp
            })
            if (response.data.msg == "Success") {
                setError("Successfuly Logged In");
                setIsAdmin(response.data.type);
                setUsername(response.data.username);
                navigate("/admin")
            }
        }
        catch (err) {
            setError("Invalid or expired OTP");
        }
    }
    function otpInput(e) {
        if (e.target.value.length != 0) {
            const sibling = e.target.nextElementSibling;
            if (sibling) {
                sibling.focus()
            }
            else {
                let temp = "";
                const siblings = e.target.parentNode.children;
                for (let i = 0; i < siblings.length; i++) {
                    temp += siblings[i].value
                }
                otpVerification(temp);
            }
        }
    }
    function otpInputBackLogic(e) {
        if (e.code === "Backspace" && e.target.value.length === 0) {
            const sibling = e.target.previousElementSibling;
            if (sibling)
                sibling.focus()
        }
    }
    return (
        <div className="background-signin otp-form">
            <h2>Enter the OTP sent to your mail</h2>
            <ul className="otp-list">
                <li className="margin-10px">
                    <div className="otp-input">
                        <input type="text" className="otp-enter-design" maxLength={1}
                            onChange={otpInput} onKeyDown={otpInputBackLogic} />
                        <input type="text" className="otp-enter-design" maxLength={1}
                            onChange={otpInput} onKeyDown={otpInputBackLogic} />
                        <input type="text" className="otp-enter-design" maxLength={1}
                            onChange={otpInput} onKeyDown={otpInputBackLogic} />
                        <input type="text" className="otp-enter-design" maxLength={1}
                            onChange={otpInput} onKeyDown={otpInputBackLogic} />
                        <input type="text" className="otp-enter-design" maxLength={1}
                            onChange={otpInput} onKeyDown={otpInputBackLogic} />
                        <input type="text" className="otp-enter-design" maxLength={1}
                            onChange={otpInput} onKeyDown={otpInputBackLogic} />
                    </div>
                </li>
                <li className="error-msg-otp">
                    <p style = {error == "Successfully logged in" ? {color : "green"} : {color : "red"}}>{error}</p>
                </li>
            </ul>
        </div>
    )
}