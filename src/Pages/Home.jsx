import NavButtons from "../Components/Header/NavButtons";
import { UserContext } from "../Context/UserContext";
import "./Home.css";
import { Outlet, useNavigate,useLocation } from "react-router-dom";
import { useContext ,useEffect} from "react";
import SideBar from "../Components/SideBar/SideBar";
import ComposeDialog from "../Components/ComposeDialog/ComposeDialog";
import Mailtoolbar from "../Components/MailToolBar/Mailtoolbar";
import { useState } from "react";
import { getEmails } from "../authApi/emailsApi";
const Home = ({sidebarOpen,search,setSearch,filterEmails}) => {
    const { loggedInUser } = useContext(UserContext);
    const [openCompose, setOpenCompose] = useState(false);
    const [emails,setEmails] = useState([]);
    const navigate = useNavigate();
    // open email
   const openSelectedMail = (id, folder) => {
  navigate(`/email/${id}`, {
    state: {
      folder,
    },
  });
};

   const loadEmails =async()=> {
      const response = await getEmails();
     setEmails(response);
  }
  const handleEmailSent = (newEmail) => {
    setEmails((prevEmails) => [
        ...prevEmails,
        newEmail
    ]);
};
const location = useLocation();
useEffect(()=> {
  setSearch("");
},[location.pathname]);
  useEffect(()=> {
      loadEmails();
  },[]);
  return (
    <>
      {loggedInUser ? (
        // Logged-in user
         <div className="mail-container">
          <SideBar open={sidebarOpen} onCompose={() => setOpenCompose(true)}/>
           <div className="mail-main">

         {/* TOOLBAR */}
         <Mailtoolbar />

      {/* PAGE CONTENT */}
      <main className="mail-content">
        <Outlet
          context={{ emails,setEmails,openSelectedMail,search,filterEmails}} />
      </main>

    </div>
          <ComposeDialog open={openCompose} onClose={() => setOpenCompose(false)} onEmailSent={handleEmailSent}/>
        </div>
      ) : (
        // Logged-out user
        <div className="home-container">
          <div className="home-content">
            <div className="home-logo">
              <span>D</span>-mail
            </div>

            <h1 className="home-heading">
              Welcome to D-mail
            </h1>

            <p className="home-info">
              Connect with people, have professional conversations,
              and share work-related files easily.
            </p>

            <p className="home-info">
              D-mail provides <strong>15 GB of storage</strong> so you
              can easily manage your files and conversations.
            </p>
            <NavButtons />
          </div>
        </div>

      )}
    </>
  );
};

export default Home;