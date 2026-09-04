import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import { toast } from "react-toastify";
import bcrypt from "bcryptjs";

import { UserContext } from "../Context/UserContext";
import { resetUserPassword } from "../authApi/resetUserPassword";
import "./UpdatePassword.css";

const UpdatePassword = () => {
    const { loggedInUser, setLoggedInUser } =
        useContext(UserContext);

    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState("");
    const [currentPasswordVerified, setCurrentPasswordVerified] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const handleVerifyCurrentPassword = async () => {
        if (!currentPassword.trim()) {
            setErrors({
                currentPassword: "Current Password is required",
            });
            return;
        }

        try {
            const isCurrentPasswordCorrect = await bcrypt.compare(
                currentPassword,
                loggedInUser.password
            );

            if (!isCurrentPasswordCorrect) {
                setErrors({
                    currentPassword: "Current password is incorrect",
                });
                setCurrentPasswordVerified(false);
                return;
            }
            // Current password is correct
            setCurrentPasswordVerified(true);
            setErrors((prev) => ({
                ...prev,
                currentPassword: "",
            }));

            toast.success("Current password verified");
        } catch (error) {
            console.error(error);
            setErrors({
                currentPassword: "Unable to verify current password",
            });
        }
    };
    const handleSubmit = async (event) => {
        event.preventDefault();

        const newErrors = {};
        // Current password must be verified first
        if (!currentPasswordVerified) {
            setErrors({
                currentPassword: "Please verify your current password first",
            });
            return;
        }
        // Validate new password
        if (!newPassword.trim()) {
            newErrors.newPassword = "New Password is required";
        } else if (newPassword.length < 6) {
            newErrors.newPassword =
                "Password must be at least 6 characters";
        }

        // Validate confirm password
        if (!confirmPassword.trim()) {
            newErrors.confirmPassword =
                "Confirm Password is required";
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword =
                "Passwords do not match";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            // Check that new password is not the old password
            const isOldPassword = await bcrypt.compare(
                newPassword,
                loggedInUser.password
            );

            if (isOldPassword) {
                setErrors({
                    newPassword:
                        "New password cannot be the old password",
                });
                return;
            }
            // before saving it.
            const updatedUser = await resetUserPassword(
                loggedInUser.id,
                newPassword
            );

            setLoggedInUser(updatedUser);
            localStorage.setItem(
                "loggedInUser",
                JSON.stringify(updatedUser)
            );
            toast.success("Password updated successfully");
            navigate("/manage-account");
        } catch (error) {
            console.error(error);
            toast.error("Unable to update password");
        }
    };

    return (
        <div className="update-password-container">
            <div className="update-password-card">
                <h2>Update Password</h2>
                <p className="update-password-subtitle">
                    Create a new password for your DMail account
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="update-password-form-group">
                        <label htmlFor="currentPassword">
                            Current Password
                        </label>

                        <div className="update-password-input-wrapper">

                            <input
                                type={
                                    showCurrentPassword
                                        ? "text"
                                        : "password"
                                }
                                id="currentPassword"
                                value={currentPassword}
                                placeholder="Enter current password"
                                onPaste={(e) => e.preventDefault()}
                                onChange={(event) => {
                                    setCurrentPassword(
                                        event.target.value
                                    );

                                    setCurrentPasswordVerified(false);

                                    setErrors((prev) => ({
                                        ...prev,
                                        currentPassword: "",
                                    }));
                                }}
                            />

                            <IconButton className="current-icon"
                                type="button"
                                onClick={() =>
                                    setShowCurrentPassword(  (prev) => !prev ) } >
                                {showCurrentPassword ? (
                                    <Visibility />
                                ) : (
                                    <VisibilityOff />
                                )}
                            </IconButton>

                            <button className="verify-btn"
                                type="button"
                                onClick={handleVerifyCurrentPassword}
                                disabled={currentPasswordVerified}
                            >
                                {currentPasswordVerified
                                    ? "Verified"
                                    : "Verify"}
                            </button>
                        </div>

                        {errors.currentPassword && (
                            <span className="update-password-error">
                                {errors.currentPassword}
                            </span>
                        )}

                    </div>

                    <div className="update-password-form-group">

                        <label htmlFor="newPassword">
                            New Password
                        </label>

                        <div className="update-password-input-wrapper">
                            <input
                                type={  showNewPassword
                                        ? "text"
                                        : "password"
                                }
                                id="newPassword"
                                value={newPassword}
                                placeholder="Enter new password"
                                disabled={!currentPasswordVerified}
                                onPaste={(e) => e.preventDefault()}
                                onChange={(event) => {
                                    setNewPassword(
                                        event.target.value
                                    );

                                    setErrors((prev) => ({
                                        ...prev,
                                        newPassword: "",
                                    }));
                                }}
                            />

                            <IconButton
                                type="button"
                                disabled={!currentPasswordVerified}
                                onClick={() =>
                                    setShowNewPassword( (prev) => !prev  )  } >
                                {showNewPassword ? (
                                    <Visibility />
                                ) : (
                                    <VisibilityOff />
                                )}
                            </IconButton>

                        </div>

                        {errors.newPassword && (
                            <span className="update-password-error">
                                {errors.newPassword}
                            </span>
                        )}

                    </div>

                    <div className="update-password-form-group">
                        <label htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        <div className="update-password-input-wrapper">
                            <input
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                id="confirmPassword"
                                value={confirmPassword}
                                placeholder="Confirm new password"
                                disabled={!currentPasswordVerified}
                                onPaste={(e) => e.preventDefault()}
                                onChange={(event) => {
                                    setConfirmPassword(
                                        event.target.value
                                    );

                                    setErrors((prev) => ({
                                        ...prev,
                                        confirmPassword: "",
                                    }));
                                }}
                            />

                            <IconButton
                                type="button"
                                disabled={!currentPasswordVerified}
                                onClick={() =>
                                    setShowConfirmPassword(
                                        (prev) => !prev
                                    )
                                }
                            >
                                {showConfirmPassword ? (
                                    <Visibility />
                                ) : (
                                    <VisibilityOff />
                                )}
                            </IconButton>

                        </div>

                        {errors.confirmPassword && (
                            <span className="update-password-error">
                                {errors.confirmPassword}
                            </span>
                        )}

                    </div>

                    <div className="update-password-actions">
                        <button
                            type="button"
                            className="update-password-cancel"
                            onClick={() =>
                                navigate("/manage-account")
                            }
                        >
                            Cancel
                        </button>
                        <button type="submit"
                            className="update-password-submit">
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default UpdatePassword;


