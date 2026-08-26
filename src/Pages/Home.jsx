import NavButtons from "../Components/Header/NavButtons";
import { UserContext } from "../Context/UserContext";
import "./Home.css";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect } from "react";
import SideBar from "../Components/SideBar/SideBar";
import ComposeDialog from "../Components/ComposeDialog/ComposeDialog";
import Mailtoolbar from "../Components/MailToolBar/Mailtoolbar";
import { useState } from "react";
import { getEmails } from "../authApi/emailsApi";
import DmailCategories from "../Components/DmailCategories/DmailCategories";
import ActionSnackbar from "../Components/Common/ActionSnackBar/ActionSnackBar";
const Home = ({ sidebarOpen, search, setSearch, filterEmails }) => {
  const { loggedInUser } = useContext(UserContext);
  const [openCompose, setOpenCompose] = useState(false);
  const [emails, setEmails] = useState([]);
  const [draftToEdit, setDraftToEdit] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("primary");
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [undoEmail, setUndoEmail] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    action: null
  })
  const navigate = useNavigate();

  // open email
  const openSelectedMail = (id, folder) => {
    navigate(`/email/${id}`, {
      state: {
        folder,
      },
    });
  };

  const loadEmails = async () => {
    const response = await getEmails();
    setEmails(response);
  }
  const handleEmailSent = (newEmail, draftId) => {
    setEmails((prevEmails) => {
      const updatedEmails = draftId
        ? prevEmails.filter((email) => email.id !== draftId)
        : prevEmails;

      return [
        ...updatedEmails,
        newEmail
      ];
    });
  };
  const handleDraftSaved = (newDraft) => {
    setEmails((prevEmails) => [
      ...prevEmails,
      newDraft
    ]);
  };
  const location = useLocation();
  useEffect(() => {
    setSearch("");
  }, [location.pathname]);
  useEffect(() => {
    loadEmails();
  }, []);

  // snackbar action common for all 
  const showSnackbar = (message, action = null) => {
    setSnackbar({
      open: true,
      message,
      action
    })
  }
  const closeSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false
    }))
  }

  return (
    <>
      {loggedInUser ? (
        // Logged-in user
        <div className="mail-container">
          <SideBar open={sidebarOpen} onCompose={() => setOpenCompose(true)} />
          <div className="mail-main">

            {/* TOOLBAR */}
            <Mailtoolbar
              emails={emails}
              selectedEmails={selectedEmails}
              setSelectedEmails={setSelectedEmails}
              loadEmails={loadEmails}
              showSnackbar={showSnackbar}
            />


            {(location.pathname === "/" || location.pathname === "/inbox") && (
              <DmailCategories
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            )}

            {/* PAGE CONTENT */}
            <main className="mail-content">
              <Outlet
                context={{ emails, setEmails, loadEmails, openSelectedMail, search, filterEmails, selectedCategory, selectedEmails, setSelectedEmails, undoEmail, setUndoEmail, draftToEdit, setDraftToEdit, showSnackbar, closeSnackbar }} />
            </main>

          </div>
          <ComposeDialog
            open={openCompose || !!draftToEdit}
            onClose={() => {
              setOpenCompose(false);
              setDraftToEdit(null);
            }}
            onEmailSent={handleEmailSent}
            onDraftSaved={handleDraftSaved}
            draftToEdit={draftToEdit}
          />

          <ActionSnackbar open={snackbar.open} message={snackbar.message} onAction={snackbar.action} onClose={closeSnackbar} />
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