import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserContext } from "../Context/UserContext";
import { updateUser, checkEmailExists } from "../authApi/authApi";
import "./ManageAccount.css"

const ManageAccount = () => {
    const { loggedInUser, setLoggedInUser } = useContext(UserContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fname: "",
        lname: "",
        email: "",
        phone: "",
        dob: "",
    });

    const [emailLocked, setEmailLocked] = useState(false);
    const [nextEmailChangeDate, setNextEmailChangeDate] = useState("");

    useEffect(() => {
        if (!loggedInUser) {
            navigate("/sign-in");
            return;
        }
        setFormData({
            fname: loggedInUser.fname || "",
            lname: loggedInUser.lname || "",
            email: loggedInUser.email || "",
            phone: loggedInUser.phone || "",
            dob: loggedInUser.dob || "",
        });

        if (loggedInUser.emailLastChangedAt) {
            const lastChanged = new Date(loggedInUser.emailLastChangedAt);

            const nextChange = new Date(lastChanged);
            nextChange.setDate(nextChange.getDate() + 30);
            if (new Date() < nextChange) {
                setEmailLocked(true);
                setNextEmailChangeDate(nextChange.toLocaleDateString());
            }
        }
    }, [loggedInUser, navigate]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handlePhoneKeyDown = (event) => {
        const allowedKeys = ["Backspace", "Delete", "ArrowLeft",
            "ArrowRight","Tab", ];
        if ( !/[0-9]/.test(event.key) &&!allowedKeys.includes(event.key)) {
            event.preventDefault();
        }
        if ( formData.phone.length >= 10 && !allowedKeys.includes(event.key) ) {
            event.preventDefault();
        }
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!formData.fname.trim()) {
            toast.error("First name is required");
            return;
        }
        if (!formData.lname.trim()) {
            toast.error("Last name is required");
            return;
        }
        if (!formData.email.trim()) {
            toast.error("Email is required");
            return;
        }
        const oldEmail = loggedInUser.email.toLowerCase();
        const newEmail = formData.email.trim().toLowerCase();
        // Email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
            toast.error("Enter a valid email");
            return;
        }
        // Check only when email actually changes
        const emailChanged = oldEmail !== newEmail;
        if (emailChanged) {
            // Check whether another user already has this email
            const emailExists = await checkEmailExists(newEmail);
            if (emailExists) {
                toast.error("This email is already in use");
                return;
            }
            // 30-day email change restriction
            if (emailLocked) {
                toast.error(
                    `Email can be changed again after ${nextEmailChangeDate}`
                );
                return;
            }
        }
        if (!formData.phone.trim()) {
            toast.error("Phone number is required");
            return;
        }
        if (!/^\d{10}$/.test(formData.phone.trim())) {
            toast.error("Phone number must be 10 digits");
            return;
        }
        /*  Create a NEW object.  loggedInUser is NOT mutated.*/
        const updatedUser = {
            ...loggedInUser,
            fname: formData.fname.trim(),
            lname: formData.lname.trim(),
            email: newEmail,
            phone: formData.phone.trim(),
            dob: formData.dob,
        };
        if (emailChanged) {
            updatedUser.emailLastChangedAt = new Date().toISOString();
        }
        try {
            const savedUser = await updateUser(loggedInUser.id,updatedUser );
            setLoggedInUser(savedUser);
            localStorage.setItem("loggedInUser", JSON.stringify(savedUser) );
            toast.success("Account updated successfully");
            navigate("/inbox");
            if (emailChanged) {
                const nextChange = new Date();
                nextChange.setDate(nextChange.getDate() + 30);

                setEmailLocked(true);
                setNextEmailChangeDate(
                    nextChange.toLocaleDateString()
                );
            }
        } catch (error) {
            console.error(error);
            toast.error("Unable to update account");
        }
    };
    const hasChanges = loggedInUser &&(
        loggedInUser.fname !== formData.fname.trim() ||
        loggedInUser.lname !== formData.lname.trim() ||
        loggedInUser.email !== formData.email.trim().toLowerCase() ||
        (loggedInUser.phone || "") !== formData.phone.trim() ||
        (loggedInUser.dob || "") !== formData.dob
    );
    return (
        <div className="manage-account">
            <div className="manage-account-card">
                <div className="manage-account-header">
                    <h2>Manage your account</h2>
                    <p>Update your D-mail account information</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>First name</label>
                            <input type="text" name="fname"
                                value={formData.fname}
                                onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Last name</label>
                            <input type="text" name="lname"
                                value={formData.lname}
                                onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email"
                            value={formData.email} onChange={handleChange}
                            disabled={emailLocked} />
                        {emailLocked && (
                            <small className="email-info">
                                You can change your email again after{" "}
                                {nextEmailChangeDate}.
                            </small>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Phone</label>
                        <input type="text" name="phone"
                            value={formData.phone} onChange={handleChange}
                            maxLength="10" onKeyDown={handlePhoneKeyDown} />
                    </div>
                    <div className="form-group">
                        <label>Date of birth</label>
                        <input type="date"  name="dob" value={formData.dob}
                            onChange={handleChange} />
                    </div>
                    <div className="account-actions">
                        <button type="button"  onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                       <button type="submit" className="submit-btn" disabled={!hasChanges}>Save changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default ManageAccount