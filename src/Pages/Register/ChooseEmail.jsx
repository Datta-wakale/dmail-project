import { useMemo } from "react";
import "./ChooseEmail.css";

const DOMAIN = "@dmail.com";

const ChooseEmail = ({ fname, lname, email, setUser, error, setError, handleNext }) => {

    // generate dmail for user suggestion
    const suggestions = useMemo(() => {
        const firstName = fname.trim().toLowerCase();
        const lastName = lname.trim().toLowerCase();
        const baseSeed = Array.from(`${firstName}${lastName}`).reduce(
            (total, char) => total + char.charCodeAt(0),
            0
        );
        const deterministicNumber = 100 + (baseSeed % 900);

        return [
            `${firstName}${lastName}`,
            `${firstName}.${lastName}`,
            `${firstName}${deterministicNumber}`,
            `${firstName}${new Date().getFullYear()}`,
        ];
    }, [fname, lname]);

   // When the user types in the input, auto-append the domain if missing.
    // const handleEmailInput = (e) => {
    //     const raw = e.target.value;
    //     // If user types the domain already
    //     const normalized = raw.includes("@") ? raw : `${raw}${DOMAIN}`;
    //     setUser((prev) => ({
    //         ...prev,
    //         email: normalized,
    //     }));
    //     setError((prev) => ({
    //         ...prev,
    //         email: "",
    //     }));
    // };

    const handleEmailInput = (e) => {
    const raw = e.target.value;
    setUser((prev) => ({
        ...prev,
        email: raw,
    }));
    setError((prev) => ({
        ...prev,
        email: "",
    }));
};

const handleEmailBlur = (e) => {
    const raw = e.target.value.trim();
    if (!raw) return;
    const normalized = raw.includes("@")
        ? raw
        : `${raw}${DOMAIN}`;
    setUser((prev) => ({
        ...prev,
        email: normalized,
    }));
};
    const handleSuggestion = (suggestion) => {
        setUser((prev) => ({
            ...prev,
            email: `${suggestion}${DOMAIN}`,
        }));
        setError((prev) => ({
            ...prev,
            email: "",
        }));
    };
    // For rendering the input
    const inputValue = email || "";
    return (
        <>
            <h2>Choose your email</h2>
            <p className="step-description"> Choose an email address for your DMail account</p>
            <div className="form-group">
                <label htmlFor="email"> Email</label>
                <div className="email-input-wrapper">
                    <input type="text" id="email"
                        name="email" placeholder="Enter username"
                        value={inputValue} onChange={handleEmailInput} onBlur={handleEmailBlur}/>
                </div>
                {error.email && ( <span className="error-msg">{error.email} </span>  )}
            </div>
            <p className="suggestion-title"> Suggested email addresses  </p>
            <div className="email-suggestions">
                {suggestions.map((suggestion) => {
                    const full = `${suggestion}${DOMAIN}`;
                    return (
                        <label key={suggestion} className="suggestion-option" >
                            <input type="radio" name="emailSuggestion"
                                value={full}
                                checked={inputValue === full}
                                onChange={() => handleSuggestion(suggestion)} />
                            <span>{full}</span>
                        </label>
                    );
                })}
            </div>
            <div className="button-row">
                <button type="button" className="register-btn"
                  onClick={handleNext} > Next</button>
            </div>
        </>
    );
};
export default ChooseEmail;