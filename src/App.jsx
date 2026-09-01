import { useState } from "react";
import { BrowserRouter, Routes, Route,useLocation } from "react-router-dom";
import Header from "./Components/Header/Header";
import Home from "./Pages/Home";
import Register from "./Pages/Register/Register";
import Login from "./Pages/Login/Login";
import Inbox from "./Components/Inbox/Inbox";
import { ToastContainer } from "react-toastify";
import SentEmails from "./Components/Sent/SentEmails";
import PublicRoute from "./Route/PublicRoute";
import ProtectedRoute from "./Route/ProtectedRoute";
import TrashEmails from "./Components/Trash/TrashEmails";
import EmailsDetails from "./Pages/LandingPage/EmailsDetails";
import StarredEmails from "./Components/StarredEmails/StarredEmails";
import ForgotDmail from "./Pages/Login/ForgotDmail";
import ForgotPassword from "./Pages/Login/ForgotPassword";
import Drafts from "./Components/Drafts/Drafts.";
import Spam from "./Components/Spam/Spam"
import AllDmails from "./Components/AllDmails/AllDmails";
import Snoozed from "./Snoozed/Snoozed";
import ManageAccount from "./UserProfile/ManageAccount";
import Archive from "./Components/Archieve/Archive";
function AppContent() {
const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };
  
  const [search, setSearch] = useState("");
  const [searchFilter, setSearchFilter] = useState("all");

  const filterEmails = (emails, search, folderFilter = searchFilter) => {
    const trimmedSearch = search?.trim() || "";
    const filteredByText = !trimmedSearch
      ? emails
      : emails.filter((email) =>
          (email.sender || email.from || "")
            .toLowerCase()
            .includes(trimmedSearch.toLowerCase()) ||
          (email.receiver || email.to || "")
            .toLowerCase()
            .includes(trimmedSearch.toLowerCase()) ||
          (email.subject || "").toLowerCase().includes(trimmedSearch.toLowerCase()) ||
          (email.message || "").toLowerCase().includes(trimmedSearch.toLowerCase())
        );

    if (folderFilter === "all") {
      return filteredByText;
    }

    return filteredByText.filter((email) => {
      if (folderFilter === "inbox") {
        return email.receiverFolder === "inbox" || (email.to && email.to.includes("@"));
      }
      if (folderFilter === "sent") {
        return email.senderFolder === "sent" || email.from === email.from;
      }
      if (folderFilter === "trash") {
        return email.receiverFolder === "trash" || email.senderFolder === "trash";
      }
      if (folderFilter === "starred") {
        return Boolean(email.starred);
      }
      if (folderFilter === "spam") {
        return email.receiverFolder === "spam" || email.senderFolder === "spam";
      }
      if (folderFilter === "drafts") {
        return email.senderFolder === "draft";
      }
      if (folderFilter === "archive") {
        return email.senderFolder === "archive";
      }
      return true;
    });
  };

  return (
    <>
        {location.pathname !== "/manage-account" && (
  <Header
    sidebarOpen={sidebarOpen}
    handleToggleSidebar={handleToggleSidebar}
    search={search}
    setSearch={setSearch}
    searchFilter={searchFilter}
    setSearchFilter={setSearchFilter}
  />
)}


        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/create-acc" element={<Register />} />
            <Route path="/sign-in" element={<Login />} />
            <Route path="/forgot-pass" element={<ForgotPassword />} />
            <Route path="/forgot-dmail" element={<ForgotDmail />} />
          </Route>

          <Route path="/" element={<Home sidebarOpen={sidebarOpen} search={search} setSearch={setSearch} filterEmails={filterEmails} searchFilter={searchFilter} />} >

            <Route element={<ProtectedRoute />}>
              <Route index element={<Inbox />} />
              <Route path="inbox" element={<Inbox />} />
              <Route path="spam" element={<Spam />} />
              <Route path="sent" element={<SentEmails />} />
              <Route path="drafts" element={<Drafts />} />
              <Route path="trash" element={<TrashEmails />} />
              <Route path="starred" element={<StarredEmails />} />
              <Route path="all-mail" element={<AllDmails />} />
              <Route path="email/:id" element={<EmailsDetails />} />
              <Route path="snooze" element={<Snoozed />} />
              <Route path="archive" element={<Archive />} />
            </Route>

          </Route>
          <Route path="/manage-account" element={<ManageAccount />} />
        </Routes>
     
      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;