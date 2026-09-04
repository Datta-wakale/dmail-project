import { useContext } from "react";
import { UserContext } from "../Context/UserContext";

const WelcomeEmailCard = () => {
  const { loggedInUser } = useContext(UserContext);

  if (!loggedInUser) {
    return null;
  }

  return (
    <div className="welcome-email-card">
      <span className="welcome-email-badge">Welcome</span>
      <h3 className="welcome-email-title">Welcome to D-mail, {loggedInUser.fname || "there"}!</h3>
      <p className="welcome-email-copy">
        Your inbox is ready. This is your official D-mail welcome message from the team.
        Explore your messages, folders, and conversations from  Dmail-style inbox.
      </p>
      <div className="welcome-email-meta">
        <span>From:</span>
        <strong>D-mail Team</strong>
      </div>
    </div>
  );
};

export default WelcomeEmailCard;
