import { useState } from "react";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import "./SnoozeDialog.css";

const SnoozeDialog = ({
    open,
    onClose,
    onSnooze
}) => {

    const [dateTime, setDateTime] = useState("");
    // Later today - 6 PM
    const getTodayEvening = () => {
        const date = new Date();
        date.setHours(18, 0, 0, 0);
        // use tomorrow 6 PM
        if (date <= new Date()) {
            date.setDate(date.getDate() + 1);
        }
        return date;
    };

    // Tomorrow - 8 AM
    const getTomorrowMorning = () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        date.setHours(8, 0, 0, 0);
        return date;
    };

    // Next week - 8 AM
    const getNextWeek = () => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        date.setHours(8, 0, 0, 0);
        return date;
    };

    // Convert Date to datetime-local format
    const formatDateTimeLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(
            date.getDate()
        ).padStart(2, "0");

        const hours = String(
            date.getHours()
        ).padStart(2, "0");

        const minutes = String(
            date.getMinutes()
        ).padStart(2, "0");

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Quick snooze
    const handleQuickSnooze = (date) => {
        onSnooze(date.toISOString());
        setDateTime("");
        onClose();
    };

    // Custom date/time
    const handleCustomSnooze = () => {
        if (!dateTime) {
            return;
        }

        const selectedDate = new Date(dateTime);
        if (selectedDate <= new Date()) {
            return;
        }
        onSnooze(selectedDate.toISOString());
        setDateTime("");
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}>

            <div className="snooze-modal" onClick={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}>

                <h2>
                    Snooze
                </h2>

                <div className="snooze-options">

                    <Button
                        fullWidth
                        onClick={() =>
                            handleQuickSnooze(
                                getTodayEvening()
                            )
                        }
                    >
                        Later today
                    </Button>

                    <Button
                        fullWidth
                        onClick={() =>
                            handleQuickSnooze(
                                getTomorrowMorning()
                            )
                        }
                    >
                        Tomorrow morning
                    </Button>

                    <Button
                        fullWidth
                        onClick={() =>
                            handleQuickSnooze(
                                getNextWeek()
                            )
                        }
                    >
                        Next week
                    </Button>

                    <div className="custom-snooze">

                        <p>
                            Pick date & time
                        </p>

                        <input
                            type="datetime-local"
                            value={dateTime}
                            min={formatDateTimeLocal(
                                new Date()
                            )}
                            onChange={(event) =>
                                setDateTime(
                                    event.target.value
                                )
                            }
                        />

                    </div>

                </div>

                <div className="snooze-actions">

                    <Button
                        onClick={onClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleCustomSnooze}
                        disabled={!dateTime}
                    >
                        Snooze
                    </Button>

                </div>

            </div>

        </Modal>
    );
};

export default SnoozeDialog;