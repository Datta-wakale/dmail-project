import { Dialog,  DialogTitle, DialogContent, DialogActions,Button,TextField, Typography, IconButton,} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useEffect, useState } from "react";

const PhoneVerificationDialog = ({ open,currentPhone = "",onClose,onVerified,}) => {
    const [phoneData, setPhoneData] = useState({
        step: 1,
        phone: "",
        otp: "",
        generatedOtp: "",
        error: "",
    });

    useEffect(() => {
        if (open) {
            setPhoneData({
                step: 1,
                phone: "",
                otp: "",
                generatedOtp: "",
                error: "",
            });
        }
    }, [open]);

    const generateOtp = () => {
        return Math.floor(
            100000 + Math.random() * 900000
        ).toString();
    };

    const handlePhoneChange = (event) => {
        const value = event.target.value;

        if (!/^\d{0,10}$/.test(value)) {
            return;
        }

        setPhoneData((prev) => ({
            ...prev,
            phone: value,
            error: "",
        }));
    };

    const handleSendOtp = () => {
        const phone = phoneData.phone.trim();

        if (!phone) {
            setPhoneData((prev) => ({
                ...prev,
                error: "Phone number is required",
            }));
            return;
        }

        if (!/^\d{10}$/.test(phone)) {
            setPhoneData((prev) => ({
                ...prev,
                error: "Phone number must be exactly 10 digits",
            }));
            return;
        }

        const newOtp = generateOtp();
        setPhoneData((prev) => ({
            ...prev,
            phone,
            otp: "",
            generatedOtp: newOtp,
            error: "",
            step: 2,
        }));
    };

    const handleOtpChange = (event) => {
        const value = event.target.value;

        if (!/^\d{0,6}$/.test(value)) {
            return;
        }
        setPhoneData((prev) => ({
            ...prev,
            otp: value,
            error: "",
        }));
    };

    const handleVerify = () => {
        const enteredOtp = phoneData.otp.trim();
        if (!enteredOtp) {
            setPhoneData((prev) => ({
                ...prev,
                error: "Please enter the verification code",
            }));
            return;
        }
        if (!/^\d{6}$/.test(enteredOtp)) {
            setPhoneData((prev) => ({
                ...prev,
                error: "Verification code must be 6 digits",
            }));
            return;
        }
        if ( !phoneData.generatedOtp || enteredOtp !== phoneData.generatedOtp) {
            setPhoneData((prev) => ({
                ...prev,
                error: "Invalid verification code",
            }));
            return;
        }
        onVerified(phoneData.phone);
    };

    const handleBack = () => {
        setPhoneData((prev) => ({
            ...prev,
            step: 1,
            otp: "",
            generatedOtp: "",
            error: "",
        }));
    };

    const handleClose = () => {
        setPhoneData({
            step: 1,
            phone: "",
            otp: "",
            generatedOtp: "",
            error: "",
        });
        onClose();
    };

    return (
        <Dialog open={open}onClose={handleClose}
            maxWidth="xs" fullWidth>
            {phoneData.step === 1 && (
                <>
                    <DialogTitle>  {currentPhone
                            ? "Change mobile number"
                            : "Add mobile number"}
                    </DialogTitle>
                    <DialogContent>
                        <Typography  variant="body2"  color="text.secondary"
                            sx={{ mb: 2 }} >
                            {currentPhone
                                ? "Enter your new mobile number."
                                : "Enter your mobile number to verify it."}
                        </Typography>

                        {currentPhone && (
                            <Typography  variant="body2" sx={{ mb: 2 }} >
                                Current number:{" "}
                                <strong>{currentPhone}</strong>
                            </Typography>
                        )}

                        <TextField fullWidth label="Mobile number"  value={phoneData.phone}
                            onChange={handlePhoneChange} error={Boolean(phoneData.error)}
                            helperText={
                                phoneData.error ||
                                "Enter exactly 10 digits"
                            }
                            inputMode="numeric"
                            autoFocus
                            slotProps={{
                                htmlInput: {
                                    maxLength: 10,
                                    inputMode: "numeric",
                                },
                            }}

                        />
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={handleClose}> Cancel </Button>

                        <Button variant="contained" onClick={handleSendOtp} >
                            Send OTP
                        </Button>
                    </DialogActions>
                </>
            )}

            {phoneData.step === 2 && (
                <>
                    <DialogTitle sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                        }} >
                        <IconButton size="small" onClick={handleBack} >
                            <ArrowBackIcon />
                        </IconButton>
                        Verify mobile number
                    </DialogTitle>

                    <DialogContent>
                        <Typography variant="body2"
                            color="text.secondary">
                            Enter the verification code sent to:
                        </Typography>
                        <Typography sx={{
                                fontWeight: 600,
                                mt: 1,
                                mb: 3,
                            }}
                        >
                            {phoneData.phone}
                        </Typography>

                        <TextField  fullWidth  label="Verification code"
                            value={phoneData.otp} onChange={handleOtpChange}
                            error={Boolean(phoneData.error)} helperText={phoneData.error}
                            inputMode="numeric" autoFocus
                            slotProps={{
                                htmlInput: {
                                    maxLength: 10,
                                    inputMode: "numeric"
                                },
                            }}

                        />
                        <Typography variant="caption" color="text.secondary"
                            sx={{
                                display: "block",
                                textAlign: "center",
                                mt: 2,
                            }} >
                            Demo OTP:{" "}
                            <strong>
                                {phoneData.generatedOtp}
                            </strong>
                        </Typography>

                        <Button size="small"
                            onClick={handleSendOtp}
                            sx={{
                                display: "block",
                                mx: "auto",
                                mt: 1,
                            }} >
                            Resend OTP
                        </Button>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}> Cancel </Button>

                        <Button variant="contained"
                            onClick={handleVerify}>
                            Verify
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
};
export default PhoneVerificationDialog;