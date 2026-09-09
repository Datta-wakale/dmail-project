import { describe, test,expect } from "vitest";
import { render,screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import NavButtons from "./NavButtons";
import userEvent from "@testing-library/user-event";

describe("NavButtons Component", ()=> {

    const renderNavButtons = ()=> {

       render(
           <MemoryRouter>
                <UserContext.Provider value={{loggedInUser : null}}>
                    <NavButtons/>
                </UserContext.Provider>
           </MemoryRouter> 
       )
    };

    test("should display Sign In and create button", ()=> {
        renderNavButtons();

        expect(screen.getByText("Sign In")).toBeInTheDocument();
        expect(screen.getByText("Create account")).toBeInTheDocument();
    });

    test("should show account dropdown when Create account is clicked", async()=> {

        const user = userEvent.setup();
        renderNavButtons();
        const createAccountButton = screen.getByText("Create account");
        await user.click(createAccountButton);
        
        expect(screen.getByText("For personal use")).toBeInTheDocument();
        expect(screen.getByText("For work or business")).toBeInTheDocument();
    })
});