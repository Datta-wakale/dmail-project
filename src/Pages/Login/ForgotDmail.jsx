import { useState } from "react"
import { useNavigate , Link} from "react-router-dom";
import { checkPhoneExists } from "../../authApi/authApi";
import { toast } from "react-toastify";
import OtpDialog from "./OtpDialog"
const ForgotDmail = () => {
    const [user, setUser] = useState({ phone: "", otp: "",email: ""})
    const [step, setStep] = useState(1);
    const [error, setError] = useState("");
    const [generatedOtp, setGeneratedOtp] = useState("");
    const [openOtpDialog, setOpenOtpDialog] = useState(false);
    const navigate = useNavigate();
    const handleChange = (event) => {
        const { name, value } = event.target;
        setUser((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError("");
    };
    // STEP 1 - Check phone number
    const handlePhoneSubmit = async (event) => {
        event.preventDefault();
        if (!user.phone.trim()) {
            setError("Phone number is required");
            return;
        }
        try {
            const foundUser = await checkPhoneExists(user.phone.trim());
            console.log("foundUser ::")
            if (!foundUser) {
                setError("Enter a valid phone number");
                return;
            }
            // Store found user's email
            setUser((prev) => ({
                ...prev,
                email: foundUser.email,
                otp: "",
            }));
            // Generate OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(otp);
            // Open OTP dialog
            setOpenOtpDialog(true);
            setError("");
        } catch (error) {
            console.error(error);
            setError("Unable to verify phone number");
        }
    };
    // Close OTP dialog
    const handleOtpDialogClose = () => {
        setOpenOtpDialog(false);
        setStep(2);
    };
    // STEP 2 - Verify OTP
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
    // STEP 3 - Go to login
    const handleGoToLogin = () => {
        toast.success("DMail found successfully");
        navigate("/sign-in");
    };

    return (
        <div className="forgot-container">
            <div className="forgot-card">
                {step === 1 && (
                    <>
                        <h2>Forgot DMail?</h2>
                        <p className="forgot-subtitle"> Enter your phone number to find your DMail </p>
                        <form onSubmit={handlePhoneSubmit}>
                            <div className="forgot-form-group">
                                <label htmlFor="phone">Phone Number</label>
                                <input type="text" name="phone" value={user.phone} onChange={handleChange} />
                                {error && (<span className="forgot-error">{error}</span>)}
                            </div>
                            <button type="submit" className="forgot-btn">Next</button>
                        </form>
                    </>
                )}
                {step === 2 && (
                    <>
                        <h2>Verify OTP</h2>
                        <p className="forgot-subtitle"> Enter the OTP sent to your phone</p>
                        <form onSubmit={handleOtpSubmit}>
                            <div className="forgot-form-group">
                                <label>Otp</label>
                                <input type="number" name="otp" placeholder="Enter 6 digit otp"
                                    value={user.otp} onChange={handleChange} />
                                {error && <span className="forgot-error">{error}</span>}
                            </div>
                            <button type="submit" className="forgot-btn">Verify otp</button>
                        </form>
                    </>
                )}
                {step === 3 && (
                    <>
                        <h2>Your DMail</h2>
                        <p className="forgot-subtitle">Your DMail address is</p>
                        <div className="forgot-form-group">
                            <input type="text" value={user.email} readOnly />
                        </div>
                        <button type="button" className="forgot-btn" onClick={handleGoToLogin}>
                            Go to Sign In
                        </button>
                    </>
                )}
                <Link to="/sign-in" className="back-login-link">
                    Back to sign in
                </Link>
            </div>
            <OtpDialog open={openOtpDialog} otp={generatedOtp}
                onClose={handleOtpDialogClose} />
        </div>);
};

export default ForgotDmail
