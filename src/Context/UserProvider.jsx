import { useState } from "react"
import { UserContext } from "./UserContext"
const UserProvider = ({children})=> {

    const [loggedInUser, setLoggedInUser] = useState(
        JSON.parse(localStorage.getItem("loggedInUser"))
    )

    return (
        <UserContext.Provider value={{loggedInUser,setLoggedInUser}}>
            {children}
        </UserContext.Provider>
    )
}

export default UserProvider