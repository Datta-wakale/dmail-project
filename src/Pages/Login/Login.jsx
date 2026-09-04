import { useContext, useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import { loginUser, checkEmailExists } from "../../authApi/authApi";
import { toast } from "react-toastify";
import { UserContext } from "../../Context/UserContext";
import "./Login.css";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Visibility, VisibilityOff } from "@mui/icons-material";
const Login = () => {
  const { setLoggedInUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState({});
  const handleChange = (event) => {
    const { name, value } = event.target;

    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError((prev) => ({
      ...prev,
      [name]: "",
      login: "",
    }));
  };

  // handle password visibility
  const passwordToggle = ()=> {
     setShowPassword((visible)=> !visible);
  }

  // STEP 1 - Validate Email
  const handleEmailNext = async () => {
    const newErrors = {};

    if (!user.email.trim()) {
      newErrors.email = "dmail is required";
      setError(newErrors);
      return;
    }
    // Add @dmail.com automatically
    let loginEmail = user.email.trim();

    if (!loginEmail.includes("@")) {
      loginEmail = `${loginEmail}@dmail.com`;
      // Update input also
      setUser((prev) => ({
        ...prev,
        email: loginEmail,
      }));
    }

    try {
      const emailExists = await checkEmailExists(loginEmail);
      if (!emailExists) {
        setError({
          email: "Enter a valid DMail address",
        });
        return;
      }
      // Email is valid
      setError({});
      setStep(2);

    } catch (err) {
      console.error(err);
      setError({
        email: "Unable to verify dmail. Please try again.",
      });
    }
  };

  // STEP 2 - Validate Password and Login
  const handleLogin = async (event) => {
    event.preventDefault();

    const newErrors = {};

    if (!user.password.trim()) {
      newErrors.password = "Password is required";
      setError(newErrors);
      return;
    }

    try {
      const result = await loginUser(
        user.email,
        user.password
      );
      if (!result) {
        setError({
          login: "Invalid dmail or password",
        });
        return;
      }
      setLoggedInUser(result);
      localStorage.setItem("loggedInUser", JSON.stringify(result));
      toast.success("Welcome, Login successful");
      navigate("/");
    } catch (err) {
      console.error(err);
      setError({ login: "Unable to login. Please try again.", });
    }
  };
  // Go back from password to email
  const handleBack = () => {
    setError({});
    setStep(1);
  };

  return (
    <div className="signin-container">
      <div className="signin-card">

        {step === 1 && (
          <>
            <h2>Sign in</h2>
            <p className="signin-subtitle"> Use your DMail account to continue </p>
            <div className="signin-form-group">
              <label htmlFor="dmail">Dmail </label>
              <input type="text" id="dmail" name="email"
                placeholder="Enter your dmail" value={user.email}
                onChange={handleChange} />
              {error.email && (<span className="signin-error"> {error.email} </span>)}
              <Link to="/forgot-dmail" className="forgot-link" > Forgot DMail? </Link>
            </div>
            <button type="button" className="signin-btn" onClick={handleEmailNext}  > Next </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Welcome back</h2>
            <p className="signin-subtitle"> Enter your password to continue  </p>
            <div className="signin-form-group">
               <IconButton onClick={handleBack} className="back-btn">
                <ArrowBackIcon />
              </IconButton>
              <label htmlFor="email"> Email </label>
              <input type="text" id="email" value={user.email} disabled />
            </div>
            <div className="signin-form-group">
              <label htmlFor="password"> Password</label>
              <input type={showPassword ? "text" : "password"} id="password" name="password"
                placeholder="Enter your password" value={user.password}
                onChange={handleChange} className="toggletype"/>
                <IconButton onClick={passwordToggle} className="toggle-btn">
                    { showPassword ? <Visibility/>  : <VisibilityOff/>}
                </IconButton>
              {error.password && (<span className="signin-error"> {error.password}  </span>)}
               <Link to="/forgot-pass" className="forgot-link" > Forgot Password? </Link>
            </div>
            {error.login && (<div className="login-error"> {error.login} </div>)}
            <div className="login-button-row">
              {/* <button type="button" className="back-btn" onClick={handleBack} > Back</button> */}
             
              <button type="button" className="signin-btn"
                onClick={handleLogin} >
                Sign in</button>
            </div>
          </>
        )}
        <div className="create-account-text"> Don't have an account? </div>
        <button type="button"
          className="create-account-btn"
          onClick={() => navigate("/create-acc")}> Create account
        </button>
      </div>
    </div>
  );
};

export default Login;