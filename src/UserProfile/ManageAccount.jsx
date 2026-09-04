import { useContext, useEffect, useRef,useState,} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserContext } from "../Context/UserContext";
import { updateUser , checkEmailExists } from "../authApi/authApi";
import EmailChangeDialog from "./EmailChangeDialog";
import PhoneVerificationDialog from "./PhoneVerificationDialog";
import "./ManageAccount.css";

const MAX_EMAIL_CHANGE_ATTEMPTS = 2;
const EMAIL_CHANGE_DAYS = 30;

const ManageAccount = () => {
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [phoneVerificationOpen, setPhoneVerificationOpen] =useState(false);
    const [emailEditingEnabled, setEmailEditingEnabled] =useState(false);
    const { loggedInUser, setLoggedInUser } = useContext(UserContext);

    const navigate = useNavigate();

    const [formData, setFormData] = useState(() => ({
        fname: loggedInUser?.fname || "",
        lname: loggedInUser?.lname || "",
        email: loggedInUser?.email || "",
        phone: loggedInUser?.phone || "",
        dob: loggedInUser?.dob || "",
    }));

    const [phoneVerified, setPhoneVerified] = useState(
        Boolean(loggedInUser?.phoneVerified));

    const emailInputRef = useRef(null);

    const [errors, setErrors] = useState({
        fname: "",
        lname: "",
        email: "",
        phone: "",
        dob: "",
    });

    useEffect(() => {
        if (!loggedInUser) {
            navigate("/sign-in");
        }
    }, [loggedInUser, navigate]);

    useEffect(() => {
        if (!loggedInUser) {
            return;
        }

        setFormData({
            fname: loggedInUser.fname || "",
            lname: loggedInUser.lname || "",
            email: loggedInUser.email || "",
            phone: loggedInUser.phone || "",
            dob: loggedInUser.dob || "",
        });

        setPhoneVerified(Boolean(loggedInUser.phoneVerified));
    }, [loggedInUser]);

    const getEmailChangeInfo = () => {
        if (!loggedInUser) {
            return {
                attemptsLeft: MAX_EMAIL_CHANGE_ATTEMPTS,
                locked: false,
                nextDate: "",
            };
        }

        const attemptsLeft =
            typeof loggedInUser.emailChangeAttempts === "number"
                ? loggedInUser.emailChangeAttempts
                : MAX_EMAIL_CHANGE_ATTEMPTS;

        const startedAt =  loggedInUser.emailChangeWindowStartedAt;

        if (!startedAt) {
            return {
                attemptsLeft,
                locked: attemptsLeft <= 0,
                nextDate: "",
            };
        }

        const startDate = new Date(startedAt);
        const nextDate = new Date(startDate);

        nextDate.setDate(
            nextDate.getDate() + EMAIL_CHANGE_DAYS
        );

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

    const validateName = (value,fieldName,  required = false) => {
        const name = String(value || "").trim();

        if (!name) {
            return required
                ? `${fieldName} is required`
                : "";
        }

        if (!/^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/.test(name)) {
            return `${fieldName} must contain letters only`;
        }
        return "";
    };

    const validateEmail = (value) => {
        const email = String(value || "")
            .trim()
            .toLowerCase();
        if (!email) {
            return "Email is required";
        }
        if (email.length > 254) {
            return "Email is too long";
        }
        if ( !/^[A-Za-z0-9][A-Za-z0-9._-]*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email )) {
            return "Enter a valid email";
        }
        return "";
    };

    const validatePhone = (value) => {
        const phone = String(value || "").trim();
        if (!phone) {
            return "";
        }
        if (!/^\d{10}$/.test(phone)) {
            return "Phone number must be exactly 10 digits";
        }
        return "";
    };

    const validateDob = (dobValue) => {
        if (!dobValue) {
            return "Date of birth is required";
        }
        const [year, month, day] =
            dobValue.split("-").map(Number);
        if (!year || !month || !day) {
            return "Enter a valid date of birth";
        }
        if ( year < 1900 ||  year > new Date().getFullYear()) {
            return "Enter a valid date of birth";
        }

        const dob = new Date(  year, month - 1,day);

        if ( dob.getFullYear() !== year || dob.getMonth() !== month - 1 ||dob.getDate() !== day ) {
            return "Enter a valid date of birth";
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dob > today) {
            return "Date of birth cannot be in future";
        }
        let age = today.getFullYear() - year;

        if ( today.getMonth() + 1 < month || (
                today.getMonth() + 1 === month &&
                today.getDate() < day
            )
        ) {
            age--;
        }
        if (age < 12) {
            return "You must be at least 12 years old";
        }
        return "";
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === "fname") {
            setErrors((prev) => ({
                ...prev,
                fname: validateName(
                    value,
                    "First name",
                    true
                ),
            }));
        }

        if (name === "lname") {
            setErrors((prev) => ({
                ...prev,
                lname: validateName(
                    value,
                    "Last name"
                ),
            }));
        }

        if (name === "email") {
            setErrors((prev) => ({
                ...prev,
                email: validateEmail(value),
            }));
        }

        if (name === "dob") {
            setErrors((prev) => ({
                ...prev,
                dob: validateDob(value),
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

    const handleOpenPhoneVerification = () => {
        setPhoneVerificationOpen(true);
    };

    const handlePhoneVerified = (verifiedPhone) => {
        setFormData((prev) => ({
            ...prev,
            phone: verifiedPhone,
        }));

        setErrors((prev) => ({
            ...prev,
            phone: "",
        }));

        setPhoneVerified(true);
        setPhoneVerificationOpen(false);

        toast.success("Mobile number verified");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const fnameError = validateName( formData.fname, "First name", true );

        const lnameError = validateName(
            formData.lname,
            "Last name"
        );

        const emailError = validateEmail(
            formData.email
        );

        const phoneError = validatePhone( formData.phone );
        const dobError = validateDob(
            formData.dob
        );

        const validationErrors = {
            fname: fnameError,
            lname: lnameError,
            email: emailError,
            phone: phoneError,
            dob: dobError,
        };

        if ( Object.values(validationErrors).some( Boolean )) {
            setErrors(validationErrors);
            return;
        }

        const phone = formData.phone.trim();

        if (phone && !phoneVerified) {
            toast.error(
                "Please verify your mobile number"
            );
            return;
        }

        const oldEmail =
            String(loggedInUser.email || "")
                .trim()
                .toLowerCase();

        const newEmail =
            formData.email.trim().toLowerCase();

        const emailChanged =
            oldEmail !== newEmail;

        if (emailChanged) {
            try {
                const emailExists =
                    await checkEmailExists(newEmail);
                if (emailExists) {
                    setErrors((prev) => ({
                        ...prev,
                        email:
                            "This email is already in use",
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

            const info = getEmailChangeInfo();

            if (info.locked) {
                setErrors((prev) => ({
                    ...prev,
                    email:
                        `You have used all 2 email change attempts. ` +
                        `You can change your email again after ${info.nextDate}.`,
                }));

                return;
            }
        }

        const updatedUser = {
            ...loggedInUser,
            fname: formData.fname.trim(),
            lname: formData.lname.trim(),
            email: newEmail,
            phone,
            phoneVerified: phone
                ? phoneVerified
                : false,
            dob: formData.dob,
        };

        if (emailChanged) {
            const info = getEmailChangeInfo();

            const existingAliases =
                Array.isArray(
                    loggedInUser.emailAliases
                )
                    ? loggedInUser.emailAliases
                    : [];

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
            const savedUser = await updateUser(
                loggedInUser.id,
                updatedUser
            );

            setLoggedInUser(savedUser);

            localStorage.setItem(
                "loggedInUser",
                JSON.stringify(savedUser)
            );

            toast.success(
                "Account updated successfully"
            );

            navigate("/inbox");
        } catch (error) {
            console.error(error);
            toast.error(
                "Unable to update account"
            );
        }
    };

    const hasChanges =  loggedInUser &&
        (loggedInUser.fname !== formData.fname.trim() ||
            loggedInUser.lname !== formData.lname.trim() ||
            loggedInUser.email !== formData.email.trim().toLowerCase() ||
            (loggedInUser.phone || "") !== formData.phone.trim() ||
            (loggedInUser.dob || "") !==  formData.dob );

    const maxDob = new Date(
        new Date().getFullYear() - 12,
        new Date().getMonth(),
        new Date().getDate()
    ) .toISOString()
        .split("T")[0];

    return (
        <div className="manage-account">
            <div className="manage-account-card">
                <div className="manage-account-header">
                    <h2>Manage your account</h2>
                    <p>
                        Update your D-mail account
                        information
                    </p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>  First name </label>
                            <input  type="text" name="fname"
                                value={formData.fname}  onChange={handleChange}
                                maxLength={50} placeholder="Enter First Name"/>
                            {errors.fname && (
                                <small className="input-error">  {errors.fname} </small>
                            )}
                        </div>
                        <div className="form-group">
                            <label> Last name (optional) </label>
                            <input type="text"  name="lname" value={formData.lname} onChange={handleChange}
                                maxLength={50} placeholder="Enter last Name" />

                            {errors.lname && (
                                <small className="input-error"> {errors.lname}</small>
                            )}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>  Email </label>
                        <input type="email"  name="email" value={formData.email}
                            ref={emailInputRef} onChange={handleChange}
                            onFocus={handleEmailFocus}
                            readOnly={
                                emailChangeInfo.locked || !emailEditingEnabled
                            }
                            maxLength={100}
                        />
                        {errors.email && (
                            <small className="input-error"> {errors.email} </small>
                        )}

                        {!errors.email &&
                            !emailChangeInfo.locked && (
                                <small className="email-info">
                                    {
                                        emailChangeInfo.attemptsLeft
                                    }{" "}
                                    email change{" "}
                                    {emailChangeInfo
                                        .attemptsLeft === 1
                                        ? "attempt"
                                        : "attempts"}{" "}
                                    remaining.
                                </small>
                            )}

                        {emailChangeInfo.locked && (
                            <small className="email-info">
                                You have used all 2
                                email change attempts.
                                You can change your
                                email again after{" "}
                                {
                                    emailChangeInfo.nextDate
                                }.
                            </small>
                        )}
                    </div>

                    <div className="form-group">
                        <label>  Phone (optional) </label>
                        {formData.phone ? (
                            <>
                                <div className="phone-display">
                                    {formData.phone}
                                </div>

                                {phoneVerified ? (
                                    <small className="phone-verified">
                                        ✓ Mobile number verified
                                    </small>
                                ) : (
                                    <small className="phone-info">
                                        Mobile number is not verified.
                                    </small>
                                )}

                                <button type="button"
                                    className="verify-phone-btn"
                                    onClick={handleOpenPhoneVerification}>
                                    {phoneVerified
                                        ? "Change phone number"
                                        : "Verify mobile number"}
                                </button>
                            </>
                        ) : (
                            <>
                                <small className="phone-info">  No mobile number added. </small>
                                <button type="button" className="verify-phone-btn"
                                    onClick={ handleOpenPhoneVerification } >
                                    Add mobile number
                                </button>
                            </>
                        )}

                        {errors.phone && (
                            <small className="input-error"> {errors.phone}  </small>
                        )}
                    </div>
                    <div className="form-group">
                        <label> Date of birth </label>
                        <input type="date" name="dob"
                            value={formData.dob} onChange={handleChange}
                            max={maxDob} />

                        {errors.dob && ( <small className="input-error">  {errors.dob}</small> )}
                    </div>

                    <div className="account-actions">
                        <button type="button" className="update-password-btn"
                            onClick={() =>  navigate( "/update-password") }>
                            Update Password
                        </button>
                        <div className="right-actions">
                            <button type="button"
                                onClick={() => navigate("/inbox")}>
                                Cancel
                            </button>

                            <button type="submit"
                                className="submit-btn" disabled={!hasChanges} >
                                Save changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <EmailChangeDialog
                open={emailDialogOpen}
                onClose={
                    handleEmailDialogCancel
                }
                onCancel={handleEmailDialogCancel}
                onContinue={ handleEmailDialogContinue }
                attemptsLeft={ emailChangeInfo.attemptsLeft} />

            <PhoneVerificationDialog
                open={phoneVerificationOpen}
                currentPhone={
                    loggedInUser?.phone || ""
                }
                onClose={() =>
                    setPhoneVerificationOpen(false)
                }
                onVerified={handlePhoneVerified }
            />
        </div>
    );
};

export default ManageAccount;

