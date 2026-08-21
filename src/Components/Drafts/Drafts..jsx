import { useOutletContext } from "react-router-dom"

const Drafts = ()=> {

    const {emails, setEmails} = useOutletContext();
    
    return(
        <>
            <p className="no-email">No Dmail is avalable at this time</p>
        </>
    )
}

export default Drafts