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

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showNewPassword, setShowNewPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [errors, setErrors] = useState({});

    const handleSubmit = async (event) => {
        event.preventDefault();

        const newErrors = {};

        if (!newPassword.trim()) {
            newErrors.newPassword =
                "New password is required";
        } else if (newPassword.length < 6) {
            newErrors.newPassword =
                "Password must be at least 6 characters";
        }

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword =
                "Confirm password is required";
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword =
                "Passwords do not match";
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        try {

            // Compare the new plain password with that hash.
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

            // This function hashes the new password
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

            toast.success(
                "Password updated successfully"
            );

            navigate("/manage-account");

        } catch (error) {
            console.error(error);

            toast.error(
                "Unable to update password"
            );
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

                    {/* New Password */}
                    <div className="update-password-form-group">

                        <label htmlFor="newPassword">
                            New Password
                        </label>

                        <div className="update-password-input-wrapper">

                            <input
                                type={
                                    showNewPassword
                                        ? "text"
                                        : "password"
                                }
                                id="newPassword"
                                value={newPassword}
                                placeholder="Enter new password"
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
                                onClick={() =>
                                    setShowNewPassword(
                                        (prev) => !prev
                                    )
                                }
                            >
                                {showNewPassword
                                    ? <Visibility />
                                    : <VisibilityOff />
                                }
                            </IconButton>

                        </div>

                        {errors.newPassword && (
                            <span className="update-password-error">
                                {errors.newPassword}
                            </span>
                        )}

                    </div>

                    {/* Confirm Password */}
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
                                onClick={() =>
                                    setShowConfirmPassword(
                                        (prev) => !prev
                                    )
                                } >
                                {showConfirmPassword
                                    ? <Visibility />
                                    : <VisibilityOff />
                                }
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
                            onClick={() =>  navigate("/manage-account") }>
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
