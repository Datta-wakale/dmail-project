import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
function App() {

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };
  const [search, setSearch] = useState("");

  const filterEmails = (emails, search) => {
    if (!search.trim()) {
      return emails;
    }

    const searchText = search.toLowerCase().trim();

    return emails.filter((email) =>
      email.sender?.toLowerCase().includes(searchText) ||
      email.receiver?.toLowerCase().includes(searchText) ||
      email.subject?.toLowerCase().includes(searchText) ||
      email.message?.toLowerCase().includes(searchText)
    );
  };

  return (
    <>
      <BrowserRouter>
        <Header sidebarOpen={sidebarOpen} handleToggleSidebar={handleToggleSidebar} search={search} setSearch={setSearch} />

        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/create-acc" element={<Register />} />
            <Route path="/sign-in" element={<Login />} />
            <Route path="/forgot-pass" element={<ForgotPassword />} />
            <Route path="/forgot-dmail" element={<ForgotDmail/>}/>
          </Route>

          <Route path="/" element={<Home sidebarOpen={sidebarOpen} search={search} setSearch={setSearch} filterEmails={filterEmails}/>} >

            <Route element={<ProtectedRoute />}>
              <Route index element={<Inbox />} />
              <Route path="inbox" element={<Inbox />} />
              <Route path="spam" element={<Spam />} />
              <Route path="sent" element={<SentEmails />} />
              <Route path="drafts" element={<Drafts />} />
              <Route path="trash" element={<TrashEmails />} />
              <Route path="starred" element={<StarredEmails />} />
              <Route path="all-mail" element={<AllDmails/>}/>
              <Route path="email/:id" element={<EmailsDetails />} />
              <Route path="snooze" element={<Snoozed/>}/>
            </Route>

          </Route>

        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
}
export default App;