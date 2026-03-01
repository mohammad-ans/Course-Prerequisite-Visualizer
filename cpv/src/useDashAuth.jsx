import { useContext, createContext, useState, useEffect } from "react";
import api from "./api";
const DashboardAuth = createContext();
export default function useDashAuth(){
    return useContext(DashboardAuth)
} 
export function DashboardAuthProvider({children}){
    const [isAdmin, setIsAdmin] = useState(false);
    const [checking, setChecking] = useState(true);
    const [username, setUsername] = useState("Username");
    useEffect(()=>{
        async function adminCheck() {
            try{
                const response = await api.get("/logincheck");
                if (response.data.msg == "Success") {
                    setIsAdmin(response.data.type);
                    setUsername(response.data.username)
                }
            }
            catch(e){
                setIsAdmin(true);
            }
            finally{
                setChecking(false);
            }
        }
        adminCheck();
    }, [])
    return(
        <DashboardAuth.Provider value={{isAdmin, setIsAdmin, setChecking, checking, username, setUsername}}>
            {children}
        </DashboardAuth.Provider>
    )   
}