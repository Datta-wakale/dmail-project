import { useLocation, useNavigate } from "react-router-dom";
import "./AddressNotFound.css";

const AddressNotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  // If someone opens the page directly without an email
  if (!email) {
    navigate("/");
    return null;
  }
  return (
    <div className="address-not-found-page">

      {/* Header */}
      <header className="address-not-found-header">
        <div className="address-not-found-logo">
          <span className="address-not-found-logo-icon">D</span>
          <span className="address-not-found-logo-text">DMail</span>
        </div>
      </header>

      {/* Content */}
      <main className="address-not-found-main">
        <div className="address-not-found-card">

          {/* Error title */}
          <div className="address-not-found-title">
            <div className="address-not-found-error-icon">
              !
            </div>

            <h1>Address not found</h1>
          </div>

          {/* Message */}
          <p className="address-not-found-message">
            Your message wasn't delivered to
          </p>

          <p className="address-not-found-email">
            {email}
          </p>

          <p className="address-not-found-message">
            because the address couldn't be found, or is unable
            to receive email. Please check the recipient's
            email address and try again.
          </p>

          {/* Details */}
          <div className="address-not-found-details">

            <div className="address-not-found-details-header">
              Details
            </div>

            <div className="address-not-found-details-body">

              <p>
                <strong>Address:</strong> {email}
              </p>

              <p>
                <strong>Error:</strong> Recipient address not found
              </p>

              <p>
                <strong>Status:</strong> Delivery failed
              </p>

            </div>

          </div>

          {/* Actions */}
          <div className="address-not-found-actions">

            <button
              className="address-not-found-primary"
              onClick={() => navigate(-1)}
            >
              Go back
            </button>
            <button className="address-not-found-secondary"
              onClick={() => navigate("/")} >
              Go to DMail
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
export default AddressNotFound;