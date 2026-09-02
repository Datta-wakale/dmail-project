import { useState } from "react";
import { Link } from "react-router-dom";
import {  findUserByEmail, updateUser} from "../../authApi/authApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import OtpDialog from "./OtpDialog";
import IconButton from "@mui/material/IconButton";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { resetUserPassword } from "../../authApi/resetUserPassword";
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
  const [showPassword, setShowPassword] = useState(false);
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

  const handleShowPassword = ()=> {
      setShowPassword((toggle)=> !toggle);
  }

const handleEmailSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!user.email.trim()) {
        setError("DMail is required");
        return;
    }
    let email = user.email.trim().toLowerCase();

    // Add @dmail.com automatically
    if (!email.includes("@")) {
        email = `${email}@dmail.com`;
    }
    try {
        // Get the COMPLETE user object
        const foundUser = await findUserByEmail(email);
        console.log("Found user:", foundUser);
        console.log("User ID:", foundUser?.id);

        if (!foundUser) {
            setError("Enter a valid DMail address");
            return;
        }
        // Store user information
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

    setError("");
    if (!user.newPassword.trim()) {
        setError("New password is required");
        return;
    }
    if (user.newPassword.length < 6) {
        setError("Password must be at least 6 characters");
        return;
    }
    if (!user.confirmPassword.trim()) {
        setError("Confirm password is required");
        return;
    }
    if (user.newPassword !== user.confirmPassword) {
        setError("Passwords do not match");
        return;
    }
    if (!user.id) {
        setError("Unable to find user");
        return;
    }
    try {
        await resetUserPassword( user.id, user.newPassword );
        toast.success("Password reset successfully");
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
                <input type={showPassword ? "text" : "password"}  name="newPassword"  placeholder="Enter new password"  value={user.newPassword}
                  onChange={handleChange} className="icon-input"/>
                  <IconButton onClick={handleShowPassword} className="eye-icon">
                    { showPassword ?  <Visibility/> :  <VisibilityOff/>}
                </IconButton>
              </div>
              <div className="forgot-form-group">
                <label>Confirm Password</label>
                <input  type="password" name="confirmPassword"
                  placeholder="Confirm new password" value={user.confirmPassword}
                  onChange={handleChange}/>
                   <IconButton onClick={handleShowPassword} className="eye-icon">
                    { showPassword ? <Visibility/> :  <VisibilityOff/>}
                </IconButton>
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