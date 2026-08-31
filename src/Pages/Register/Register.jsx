import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, checkEmailExists } from "../../authApi/authApi";
import "./Register.css";
import { toast } from "react-toastify";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChooseEmail from "./ChooseEmail";
import IconButton from "@mui/material/Icon";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { UserContext } from "../../Context/UserContext";

const Register = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [user, setUser] = useState({
        fname: "",
        lname: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        dob: "",
    });

    const [error, setError] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const {setLoggedInUser} = useContext(UserContext);
    const handleShowPassword = () => {
        setShowPassword((show) => !show);
    }
    const handleChange = (event) => {
        const { name, value } = event.target;
        setUser((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const handlePhoneKeyDown = (event) => {
        const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab",];

        if (!/[0-9]/.test(event.key) &&
            !allowedKeys.includes(event.key)) {
            event.preventDefault();
        }

        if (user.phone.length >= 10 &&
            !allowedKeys.includes(event.key)) {
            event.preventDefault();
        }
    };
    const validateStep1 = () => {
        const errors = {};
        if (!user.fname.trim()) {
            errors.fname = "First name is required";
        }
        if (!user.lname.trim()) {
            errors.lname = "Last name is required";
        }
        setError(errors);
        return Object.keys(errors).length === 0;
    };

    const validateStep2 = async () => {
        const errors = {};

        if (!user.email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
            errors.email = "Enter a valid email";
        }
        else {
            const exists = await checkEmailExists(user.email);
            if (exists) {
                errors.email = "This dmail is already exists"
            }
        }
        setError(errors);
        return Object.keys(errors).length === 0;
    };

    const validateStep3 = () => {
        const errors = {};

        if (!user.dob) {
            errors.dob = "Date of birth is required";
        }
        else {
            const dob = new Date(user.dob);
            const today = new Date();
            today.setHours(0);
            if (dob > today) {
                errors.dob = "Date of birth cannot be in future";
            }
            else {
                let age = today.getFullYear() - dob.getFullYear();
                const monthDiff = today.getMonth() - dob.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                    age--;
                }
                if(age < 12){
                    errors.dob = "age must be greater than 12 years";
                }
            }
        }
        setError(errors);

        return Object.keys(errors).length === 0;
    };

    const validateStep4 = () => {
        const errors = {};

        if (user.password.length < 6) {
            errors.password =
                "Password must be at least 6 characters";
        }

        if (!user.confirmPassword) {
            errors.confirmPassword =
                "Confirm password is required";
        } else if ( user.password !== user.confirmPassword ) {
            errors.confirmPassword =
                "Passwords do not match";
        }

        setError(errors);

        return Object.keys(errors).length === 0;
    };

    const validateStep5 = () => {
        const errors = {};

        if (user.phone.length !== 10) {
            errors.phone =
                "Phone number must be 10 digits";
        }

        setError(errors);

        return Object.keys(errors).length === 0;
    };

    const handleNext = async () => {
        if (step === 1) {
            if (validateStep1()) {
                setStep(2);
                setError({});
            }
        }

        else if (step === 2) {
            if (await validateStep2()) {
                setStep(3);
                setError({});
            }
        }

        else if (step === 3) {
            if (validateStep3()) {
                setStep(4);
                setError({});
            }
        }

        else if (step === 4) {
            if (validateStep4()) {
                setStep(5);
                setError({});
            }
        }

        else if (step === 5) {
            if (validateStep5()) {
                handleSubmit();
            }
        }
    };

    const handleBack = () => {
        setError({});
        setStep((prev) => prev - 1);
    };
    const handleSubmit = async () => {

        const newUser = {
            fname: user.fname,
            lname: user.lname,
            email: user.email,
            phone: user.phone,
            dob: user.dob,
            password: user.password,
        };

        try {
            const createdUser = await registerUser(newUser);
            if (!createdUser) {
                toast.error("Registration failed. Please try again.");
                return;
            }

            setLoggedInUser(createdUser);
            localStorage.setItem("loggedInUser", JSON.stringify(createdUser));
            toast.success("Account Created successfully");
            navigate("/inbox");
        } catch (err) {
            console.error(err);
            toast.error("Registration failed. Please try again.");
        }
    };

    const today = new Date();
    const maxDob = today.toISOString().split("T")[0];
    return (
        <div className="form-container">
            <div className="formcard">
                {step > 1 && (
                    <ArrowBackIcon
                        className="back-arrow"
                        onClick={handleBack}
                    />
                )}
                <div className="step-counter">
                    Step {step} of 5
                </div>
                {step === 1 && (
                    <>
                        <h2>What's your name?</h2>
                        <p className="step-description"> Enter your first and last name</p>
                        <div className="form-group">
                            <label htmlFor="fname">First Name </label>
                            <input type="text" id="fname" name="fname"
                                placeholder="Enter first name" value={user.fname} onChange={handleChange} />
                            {error.fname && (<span className="error-msg">  {error.fname} </span>)}
                        </div>
                        <div className="form-group"> <label htmlFor="lname"> Last Name </label>
                            <input type="text" id="lname"
                                name="lname" placeholder="Enter last name"
                                value={user.lname} onChange={handleChange} />
                            {error.lname && (<span className="error-msg"> {error.lname}</span>)}
                        </div>
                        <button type="button" className="register-btn"
                            onClick={handleNext} >Next  </button>
                    </>
                )}
                {step === 2 && (

                    <ChooseEmail
                        fname={user.fname}
                        lname={user.lname}
                        email={user.email}
                        setUser={setUser}
                        error={error}
                        setError={setError}
                        handleChange={handleChange}
                        handleNext={handleNext} />
                )}
                {step === 3 && (
                    <>
                        <h2>Basic information</h2>

                        <p className="step-description">
                            Enter your date of birth
                        </p>

                        <div className="form-group">
                            <label htmlFor="dob">
                                Date of Birth
                            </label>

                            <input
                                type="date"
                                id="dob"
                                name="dob"
                                value={user.dob}
                                onChange={handleChange}
                                max={maxDob}
                            />

                            {error.dob && (
                                <span className="error-msg">
                                    {error.dob}
                                </span>
                            )}
                        </div>

                        <div className="button-row">
                            <button
                                type="button"
                                className="register-btn"
                                onClick={handleNext}
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}

                {step === 4 && (
                    <>
                        <h2>Create a password</h2>
                        <p className="step-description"> Your password must contain at least 6 characters.</p>
                        <div className="form-group"><label htmlFor="password"> Password
                        </label>
                            <input type={showPassword ? "text" : "password"} id="password" name="password"
                                placeholder="Enter password" value={user.password}
                                onChange={handleChange} className="placeicon" />
                            <IconButton onClick={handleShowPassword} className="eyeicon">
                                {showPassword ? (<VisibilityOff />) : <Visibility />}
                            </IconButton>
                            {error.password && (<span className="error-msg"> {error.password}</span>)}
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword"> Confirm Password </label>

                            <input type="password" id="confirmPassword" name="confirmPassword"
                                placeholder="Confirm password" value={user.confirmPassword}
                                onChange={handleChange} />
                            {error.confirmPassword && (<span className="error-msg"> {error.confirmPassword} </span>)}
                        </div>
                        <div className="button-row">
                            <button type="button" className="register-btn"
                                onClick={handleNext} > Next</button>
                        </div>
                    </>
                )}
                {step === 5 && (
                    <>
                        <h2>Add your phone number</h2>
                        <p className="step-description">  Enter your 10 digit phone number. </p>
                        <div className="form-group">
                            <label htmlFor="phone">
                                Phone
                            </label>
                            <input type="text" id="phone" name="phone"
                                placeholder="Enter 10 digit phone number" value={user.phone}
                                onChange={handleChange} onKeyDown={handlePhoneKeyDown}
                                maxLength="10" />
                            {error.phone && (<span className="error-msg">{error.phone}  </span>)}
                        </div>
                        <div className="button-row">
                            <button type="button" className="register-btn" onClick={handleNext} >
                                Create Account
                            </button>
                        </div>
                    </>
                )}
                <p className="login-text">
                    Already have an account?{" "}
                    <span className="login-link" onClick={() => navigate("/sign-in")}>Sign in </span>
                </p>
            </div>
        </div>
    );
};

export default Register;