import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../Context/UserContext";

const PublicRoute = () => {
     // get loggedInUser from the context
    const {loggedInUser} = useContext(UserContext);
    if(loggedInUser){
        return <Navigate to="/inbox" replace/>
    }
    return <Outlet/>
}

export default PublicRoute;
