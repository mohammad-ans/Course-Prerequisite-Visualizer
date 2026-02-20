import { useEffect, useRef, useState } from "react"
import api from "../api";
import "./AddCourse.css"
export default function SuperUser() {
    const [users, setUsers] = useState([]);
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [error, setError] = useState("")
    const [confirming, setConfirming] = useState(false)
    const tempEmail= useRef("")
    async function getUsers() {
        try {
            const response = await api.get("/users")
            setUsers(response.data)
            console.log(response.data)
        }
        catch (error) {
            console.error(error)
        }
    }
    useEffect(() => {
        getUsers();
    }, [])

    async function handleSubmit(e) {
        e.preventDefault()
        if (users.find((element) => element.email == email)) {
            setError("User with this email already exists")
            return;
        }
        setError("")
        try {
            const response = await api.post("/users", { "email": email, "username": username })
            console.log(response.data)
            setEmail("")
            setUsername("")
            getUsers()
        }
        catch (error) {
            console.error(error)
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
        catch (e) {
            setError("Error occured while deleting user")
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
            {confirming && <div className="dashboard-overlay">
            </div>}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
     xmlns="http://www.w3.org/2000/svg">
  <path d="M4 10.5L10.8 4.8C11.5 4.2 12.5 4.2 13.2 4.8L20 10.5
           V19C20 20.1 19.1 21 18 21H14
           V15.5C14 14.7 13.3 14 12 14
           C10.7 14 10 14.7 10 15.5V21H6
           C4.9 21 4 20.1 4 19V10.5Z"
           stroke-width="2"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"/>
</svg>
                <h2 className="dashboard-headings">
                    Manage Users
                </h2>
                <form onSubmit={handleSubmit} className="add-course-main">
                    <input type="email" value={email} placeholder="Enter email" onChange={emailChangeHandler} required/>
                    <input type="text" value={username} onChange={(e) => setUsername(e.currentTarget.value)} placeholder="Enter username" required/>
                    <button type="submit">Add User</button>
                </form>
                <div className="course-error">{error}</div>
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