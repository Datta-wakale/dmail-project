import { useState } from "react";
import { Link } from "react-router-dom";
import { checkEmailExists, updateUser} from "../../authApi/authApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import OtpDialog from "./OtpDialog";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
    oldPassword: "",
    id: "",
    fname: "",
    lname: "",
    phone: "",
    dob: "",
  });
  const [error, setError] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [openOtpDialog, setOpenOtpDialog] = useState(false);
  const navigate = useNavigate();
  // HANDLE INPUT
  const handleChange = (event) => {
    const { name, value } = event.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };


  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    if (!user.email.trim()) {
      setError("DMail is required");
      return;
    }
    let email = user.email.trim();
    // Add @dmail.com automatically
    if (!email.includes("@")) {
      email = `${email}@dmail.com`;
    }
    try {
      const foundUser = await checkEmailExists(email);
      if (!foundUser) {
        setError("Enter a valid DMail address");
        return;
      }
      // Store complete user information
      setUser((prev) => ({
        ...prev,
        ...foundUser,
        email: foundUser.email,
        oldPassword: foundUser.password,
        otp: "",
        newPassword: "",
        confirmPassword: "",
      }));
      // Generate OTP
      const otp = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      setGeneratedOtp(otp);
      // Show OTP dialog
      setOpenOtpDialog(true);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to verify DMail");
    }
  };
  // OTP DIALOG
  const handleOtpDialogClose = () => {
    setOpenOtpDialog(false);
    setStep(2);
  };

  // STEP 2 - OTP
  const handleOtpSubmit = (event) => {
    event.preventDefault();
    if (!user.otp.trim()) {
      setError("OTP is required");
      return;
    }
    if (user.otp !== generatedOtp) {
      setError("Invalid OTP");
      return;
    }
    setError("");
    setStep(3);
  };
  // STEP 3 - PASSWORD
  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (!user.newPassword.trim()) {
      setError("New password is required");
      return;
    }
    if (!user.confirmPassword.trim()) {
      setError("Confirm password is required");
      return;
    }
    // New password should not be old password
    if (user.newPassword === user.oldPassword) {
      setError("New password cannot be the old password");
      return;
    }
    // Check password match
    if (user.newPassword !== user.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      // Keep the original user structure
      const updatedUser = {
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        password: user.newPassword,
        id: user.id,
      };
      await updateUser(user.id, updatedUser);
      toast.success("Password reset successfully");
      // Reset state
      setUser({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
        oldPassword: "",
        id: "",
        fname: "",
        lname: "",
        phone: "",
        dob: "",
      });
      setGeneratedOtp("");
      setOpenOtpDialog(false);
      setError("");
      setStep(1);
      navigate("/sign-in");
    } catch (err) {
      console.error(err);
      setError("Unable to reset password");
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        {step === 1 && (
          <>
            <h2>Forgot password?</h2>
            <p className="forgot-subtitle"> Enter your DMail address to reset your password </p>
            <form onSubmit={handleEmailSubmit}>
              <div className="forgot-form-group">
                <label>DMail</label>
                <input type="text" name="email" placeholder="Enter your DMail"
                  value={user.email} onChange={handleChange} />
                {error && (<span className="forgot-error"> {error} </span> )}
              </div>
              <button type="submit" className="forgot-btn" >
                Next </button>
            </form>
          </>
        )}
        {step === 2 && (
          <>
            <h2>Verify OTP</h2>
            <p className="forgot-subtitle"> Enter the OTP sent to your DMail</p>
            <form onSubmit={handleOtpSubmit}>
              <div className="forgot-form-group">
                <label>OTP</label>
                <input type="text" name="otp"   placeholder="Enter 6 digit OTP" value={user.otp}
                  onChange={handleChange}/>
                {error && (
                  <span className="forgot-error">  {error} </span>
                )}
              </div>
              <button   type="submit" className="forgot-btn" >
                Verify OTP
              </button>
            </form>
          </>
        )}
        {step === 3 && (
          <>
            <h2>Create new password</h2>
            <p className="forgot-subtitle">Enter your new password</p>
            <form onSubmit={handlePasswordSubmit}>
              <div className="forgot-form-group">
                <label>New Password</label>
                <input type="password"  name="newPassword"  placeholder="Enter new password"  value={user.newPassword}
                  onChange={handleChange}/>
              </div>
              <div className="forgot-form-group">
                <label>Confirm Password</label>
                <input  type="password" name="confirmPassword"
                  placeholder="Confirm new password" value={user.confirmPassword}
                  onChange={handleChange}/>
              </div>
              {error && ( <span className="forgot-error"> {error}  </span> )}
              <button type="submit" className="forgot-btn"  > Reset Password </button>
            </form>
          </>
        )}
        <Link to="/sign-in" className="back-login-link">
          Back to sign in
        </Link>
      </div>
      <OtpDialog open={openOtpDialog}  otp={generatedOtp}
        onClose={handleOtpDialogClose}
      />
    </div>
  );
};

export default ForgotPassword;