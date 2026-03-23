import { useEffect, useRef, useState } from "react"
import api from "../api";
import "./AddCourse.css"
import useDashAuth from "../useDashAuth";
import { useNavigate, replace } from "react-router-dom";
export default function SuperUser() {
    const [users, setUsers] = useState([]);
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");
    const errorRef = useRef();
    const [confirming, setConfirming] = useState(false);
    const navigate = useNavigate();
    const tempEmail= useRef("");
    const {checking, isAdmin} = useDashAuth();

    useEffect(()=>{
        if(!checking)
            if(isAdmin != "admin")
                navigate("/signin");
    }, [checking])
    async function getUsers() {
        try {
            const response = await api.get("/users");
            setUsers(response.data);
        }
        catch (error) {
            errorRef.current.style.color = "red";
            if(error.status == 401){
                alert("Log In again. Your session has expired.")
                navigate("/signin", replace)
            }
            else if(error.response && error.response.data.detail) {
                setError(error.response.data.detail[0].msg);
            }
            else {
                setError("An error occured while getting users.");
            }
            
        }
    }
    useEffect(() => {
        getUsers();
    }, [])
    useEffect(()=>{
        const element = document.querySelector(".dashboard-overlay");
        if(confirming)
            element.style.display="block"
        else
            element.style.display="none"

    }, [confirming])
    async function handleSubmit(e) {
        e.preventDefault()
        if (users.find((element) => element.email == email)) {
            errorRef.current.style.color = "red";
            setError("User with this email already exists")
            return;
        }
        try {
            const response = await api.post("/users", { "email": email, "username": username })
            setEmail("")
            setUsername("")
            getUsers();
            errorRef.current.style.color = "green";
            setError("User successfully added.");
        }
        catch (error) {
            errorRef.current.style.color = "red";
            if(error.status == 401){
                alert("Log In again. Your session has expired.")
                navigate("/signin", replace)
            }
            if(error.response && error.response.data.detail) {
                setError(error.response.data.detail[0].msg);
            }
            else{
                setError("Error adding user.")
            }

        }
    }
    function emailChangeHandler(e) {
        setEmail(e.currentTarget.value);
    }
    async function removeUser(e) {
        const element = e.currentTarget.parentNode;
        const val = element.children[1].innerText;
        tempEmail.current = val;
        setConfirming(true);
    }
    async function delConfirm(){
        try {
            const response = await api.delete(`/users/${tempEmail.current}`);
        }
        catch (error) {
            
            errorRef.current.style.color = "red";
            if(error.status == 401){
                alert("Log In again. Your session has expired.")
                navigate("/signin", replace)
            }
            if(error.response && error.response.data.detail) {
                setError(error.response.data.detail[0].msg);
            }
            else{
                setError("Error deleting the user.")
            }
            return
        }
        setUsers(pre => pre.filter((element) => element.email != tempEmail.current));
        setConfirming(false);
    }
    async function actionAbort() {
        tempEmail.current = "";
        setConfirming(false);
    }
    return (
        <div className="course-page">
                <h2 className="dashboard-headings">
                    Manage Users
                </h2>
                <form onSubmit={handleSubmit} className="add-course-main">
                    <input type="email" value={email} placeholder="Enter email" onChange={emailChangeHandler} required/>
                    <input type="text" value={username} onChange={(e) => setUsername(e.currentTarget.value)} placeholder="Enter username" required/>
                    <button type="submit">Add User</button>
                </form>
                <div className="course-error" ref={errorRef}>{error}</div>
                <div className="users">
                    {users.map((element) => <div className="user" key={element.email}>
                        <div className="username-user">{element.username}</div>
                        <div className="email-user">{element.email}</div>
                        <div className="remove-user" onClick={removeUser}>-</div>
                    </div>)}
                </div>
            {confirming && <div className="confirmation">
                <p>Are you sure you want to delete the user?</p>
                <div>
                    <button onClick={delConfirm}>Yes</button>
                    <button onClick={actionAbort}>No</button>
                </div>
            </div>}
        </div>
    )
}