import { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserContext } from "../Context/UserContext";
import { updateUser, checkEmailExists } from "../authApi/authApi";
import EmailChangeDialog from "./EmailChangeDialog";
import "./ManageAccount.css"

const MAX_EMAIL_CHANGE_ATTEMPTS = 2;
const EMAIL_CHANGE_DAYS = 30;
const ManageAccount = () => {
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [emailEditingEnabled, setEmailEditingEnabled] = useState(false);
    const { loggedInUser, setLoggedInUser } = useContext(UserContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState(() => ({
        fname: loggedInUser?.fname || "",
        lname: loggedInUser?.lname || "",
        email: loggedInUser?.email || "",
        phone: loggedInUser?.phone || "",
        dob: loggedInUser?.dob || "",
    }));
    const emailInputRef = useRef(null);
    const [errors, setErrors] = useState({
        dob: "",
        email: "",
    });

    useEffect(() => {
        if (!loggedInUser) {
            navigate("/sign-in");
        }
    }, [loggedInUser, navigate]);

    const getEmailChangeInfo = () => {
        if (!loggedInUser) {
            return {
                attemptsLeft: MAX_EMAIL_CHANGE_ATTEMPTS,
                locked: false,
                nextDate: "",
            };
        }

        let attemptsLeft =
            typeof loggedInUser.emailChangeAttempts === "number"
                ? loggedInUser.emailChangeAttempts
                : MAX_EMAIL_CHANGE_ATTEMPTS;

        const startedAt = loggedInUser.emailChangeWindowStartedAt;
        // User has never changed email
        if (!startedAt) {
            return {
                attemptsLeft,
                locked: attemptsLeft <= 0,
                nextDate: "",
            };
        }

        const startDate = new Date(startedAt);
        const nextDate = new Date(startDate);

        nextDate.setDate(nextDate.getDate() + EMAIL_CHANGE_DAYS);

        // 30 days completed
        if (new Date() >= nextDate) {
            return {
                attemptsLeft: MAX_EMAIL_CHANGE_ATTEMPTS,
                locked: false,
                nextDate: "",
            };
        }

        return {
            attemptsLeft,
            locked: attemptsLeft <= 0,
            nextDate: nextDate.toLocaleDateString(),
        };
    };

    const emailChangeInfo = getEmailChangeInfo();
    const validateEmail = (value) => {
        const email = String(value || "").trim();

        if (!email) {
            return "Email is required";
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return "Enter a valid email";
        }

        return "";
    };
    const validateDob = (dobValue) => {
        if (!dobValue) {
            return "Date of birth is required";
        }
        const dob = new Date(dobValue);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dob > today) {
            return "Date of birth cannot be in future";
        }
        let age = today.getFullYear() - dob.getFullYear();
        console.log("Age calculated:: 106", age);
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        if (age < 12) {
            return "Age must be at least 12 years";
        }
        return "";
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === "dob") {
            const dobError = validateDob(value);

            setErrors((prev) => ({
                ...prev,
                dob: dobError,
            }));
        }

        if (name === "email") {
            const emailError = validateEmail(value);

            setErrors((prev) => ({
                ...prev,
                email: emailError,
            }));
        }
    };
    const handleEmailFocus = () => {
        const info = getEmailChangeInfo();
        if (info.locked) {
            return;
        }
        if (emailEditingEnabled) {
            return;
        }
        setEmailDialogOpen(true);
    };

    const handleEmailDialogCancel = () => {
        setEmailDialogOpen(false);
        setEmailEditingEnabled(false);
        // clear the ref of input field to avoid focus on it when dialog is closed
        emailInputRef.current?.blur();
        setFormData((prev) => ({
            ...prev,
            email: loggedInUser?.email || "",
        }));
        setErrors((prev) => ({
            ...prev,
            email: "",
        }));
    };

    const handleEmailDialogContinue = () => {
        setEmailDialogOpen(false);
        setEmailEditingEnabled(true);
    };

    const handlePhoneKeyDown = (event) => {
        const allowedKeys = ["Backspace", "Delete", "ArrowLeft",
            "ArrowRight", "Tab",];
        if (!/[0-9]/.test(event.key) && !allowedKeys.includes(event.key)) {
            event.preventDefault();
        }
        if (formData.phone.length >= 10 && !allowedKeys.includes(event.key)) {
            event.preventDefault();
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const dobError = validateDob(formData.dob);

        if (dobError) {
            setErrors({
                dob: dobError,
            });
            return;
        }

        setErrors({
            dob: "",
        });
        if (!formData.fname.trim()) {
            toast.error("First name is required");
            return;
        }
        // if (!formData.lname.trim()) {
        //     toast.error("Last name is required");
        //     return;
        // }
        if (!formData.email.trim()) {
            toast.error("Email is required");
            return;
        }
        const oldEmail =
            loggedInUser.email.trim().toLowerCase();

        const newEmail =
            formData.email.trim().toLowerCase();

        const emailChanged = oldEmail !== newEmail;
        // Validate email format
        const emailError = validateEmail(newEmail);
        if (emailError) {
            setErrors((prev) => ({
                ...prev,
                email: emailError,
            }));

            return;
        }
        // Only do email-change checks when email actually changes
        if (emailChanged) {
            // Check whether email already exists
            try {
                const emailExists = await checkEmailExists(newEmail);

                if (emailExists) {
                    setErrors((prev) => ({
                        ...prev,
                        email: "This email is already in use",
                    }));

                    return;
                }
            } catch (error) {
                console.error(error);
                setErrors((prev) => ({
                    ...prev,
                    email: "Unable to verify email",
                }));

                return;
            }
            // Check remaining attempts
            const info = getEmailChangeInfo();
            if (info.locked) {
                setErrors((prev) => ({
                    ...prev,
                    email: `You have used all 2 email change attempts. ` +
                        `You can change your email again after ${info.nextDate}.`,
                }));

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
            const info = getEmailChangeInfo();
            const existingAliases = Array.isArray(loggedInUser.emailAliases)
                ? loggedInUser.emailAliases : [];
            updatedUser.emailAliases = [
                ...new Set([
                    ...existingAliases,
                    oldEmail,
                ]),
            ];
            updatedUser.emailChangeAttempts =
                info.attemptsLeft - 1;
            updatedUser.emailChangeWindowStartedAt =
                loggedInUser.emailChangeWindowStartedAt ||
                new Date().toISOString();
        }
        try {
            const savedUser = await updateUser(loggedInUser.id, updatedUser);
            setLoggedInUser(savedUser);
            localStorage.setItem("loggedInUser", JSON.stringify(savedUser));
            toast.success("Account updated successfully");
            navigate("/inbox");
        } catch (error) {
            console.error(error);
            toast.error("Unable to update account");
        }
    };
    const hasChanges = loggedInUser && (
        loggedInUser.fname !== formData.fname.trim() ||
        // loggedInUser.lname !== formData.lname.trim() ||
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
                                value={formData.lname} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Email</label>

                        <input type="email" name="email"
                            value={formData.email}
                            ref={emailInputRef}
                            onChange={handleChange}
                            onFocus={handleEmailFocus}
                            readOnly={emailChangeInfo.locked || !emailEditingEnabled} />

                        {errors.email && (
                            <small className="input-error">
                                {errors.email}
                            </small>
                        )}

                        {!errors.email &&
                            !emailChangeInfo.locked && (
                                <small className="email-info">
                                    {emailChangeInfo.attemptsLeft} email change{" "}
                                    {emailChangeInfo.attemptsLeft === 1
                                        ? "attempt"
                                        : "attempts"}{" "}
                                    remaining.
                                </small>
                            )}

                        {emailChangeInfo.locked && (
                            <small className="email-info">
                                You have used all 2 email change attempts.
                                You can change your email again after{" "}
                                {emailChangeInfo.nextDate}.
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
                        <input type="date" name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            max={new Date(
                                new Date().getFullYear() - 12,
                                new Date().getMonth(),
                                new Date().getDate()
                            ).toISOString().split("T")[0]} />

                        {errors.dob && (
                            <small className="input-error">
                                {errors.dob}
                            </small>
                        )}
                    </div>

                    <div className="account-actions">

                        <button
                            type="button"
                            className="update-password-btn"
                            onClick={() => navigate("/update-password")}
                        >
                            Update Password
                        </button>

                        <div className="right-actions">
                            <button
                                type="button"
                                onClick={() => navigate("/inbox")}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={!hasChanges}
                            >
                                Save changes
                            </button>
                        </div>

                    </div>


                </form>

            </div>
            <EmailChangeDialog
                open={emailDialogOpen}
                onClose={handleEmailDialogCancel}
                onCancel={handleEmailDialogCancel}
                onContinue={handleEmailDialogContinue}
                attemptsLeft={emailChangeInfo.attemptsLeft}
            />
        </div>
    );
};
export default ManageAccount