import { useContext } from "react"
import { UserContext } from "../Context/UserContext"
import { Navigate } from "react-router-dom";


const NotFoundUrl = ()=> {

    const {loggedInUser} = useContext(UserContext);

    if(loggedInUser){
        return <Navigate to="/inbox" replace />
    }
    return <Navigate to="/" replace/>
}

export default NotFoundUrl;