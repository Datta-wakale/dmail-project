import { Navigate, Outlet, useOutletContext } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../Context/UserContext";

const ProtectedRoute = () => {
  const { loggedInUser } = useContext(UserContext);

  const outletContext = useOutletContext();

  if (!loggedInUser) {
    return <Navigate to="/sign-in" replace />;
  }
  return <Outlet context={outletContext} />;
};

export default ProtectedRoute;