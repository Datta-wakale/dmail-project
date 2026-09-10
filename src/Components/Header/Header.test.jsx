import { describe, expect, test,vi, } from "vitest";

import Header from "./Header";
import { UserContext } from "../../Context/UserContext";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";


// mock child components 
vi.mock("./Logo", ()=> ({
    default : ()=> <div>Logo</div>
}))
vi.mock("./NavButtons", ()=> ({
    default : ()=> <div>NavButtons</div>,
}))
vi.mock("./SearchBar", ()=> ({
    default : ()=> <div>SearchBar</div>
}))

describe("Header Component", ()=>{

    const setup = (props={}, loggedInUser = null) => {

        const defaultProps = {
            sidebarOpen : false,
            handleToggleSidebar: vi.fn(),
            search: "",
            setSearch: vi.fn(),
            searchFilter: "all",
            setSearchFilter: vi.fn(),
        }

        const user = userEvent.setup();
        const finalProps = {
            ...defaultProps,
            ...props
        }

        render(
            <UserContext.Provider value={{loggedInUser}}>
                 <Header {...finalProps}/>
            </UserContext.Provider>
        );
        return {
            user,
            ...finalProps
        }
    }
    // check header is rendered
   test("should render header", ()=> {
        setup();
        expect(screen.getByRole("banner")).toBeInTheDocument();
   });

   // check navbuttons render
   test("should NavButtons render",()=> {
        setup();
        const navButtons = screen.getByText("NavButtons");
        expect(navButtons).toBeInTheDocument();
   });

   // check searchbar when user is logged in
   test("should searchbar render when user is logged In", ()=> {
        setup({},
            {
                email: "datta@dmail.com"
            }
        );
        expect(screen.getByText("SearchBar")).toBeInTheDocument();
   });

   // check searchbar when user is not logged in
   test("Should not render SearchBar when user is logged out", ()=> {
        setup();
        expect(screen.queryByText(/searchbar/i)).not.toBeInTheDocument();
   });

   // check menu button when user is logged in
   test("should render menu-button when user is loggedIn", ()=> {
        setup({},
            {
                email: "datta@dmail.com"
            }
        );
        const menuButton = screen.getByRole("button");
        expect(menuButton).toBeInTheDocument();
   });

   // check menu when user is logged-out
   test("should not render menu-button when user is logged out", ()=> {
        setup();
        const buttons = screen.queryAllByRole("button");
        expect(buttons).toHaveLength(0);
   });

   // check handleToggleMenubar when menu button is clicked 
   test("Should called handletoggleSidebae when menu is clicked", async()=> {

        const handleToggleSidebar = vi.fn();
        const {user} = setup(
            {handleToggleSidebar},
            {
                email: "datta@dmail.com"
            }
        );
        const menuButton = screen.getByRole("button");
        await user.click(menuButton);
        expect(handleToggleSidebar).toHaveBeenCalled();
   });

   // check menu-open class  when sidebar is open
   test("Should add menu-class when sidebar is open",()=> {
        setup(
            {
                sidebarOpen : true,
            },
            {
                email: "datta@dmail.com",
            }
        );
        const menuButton = screen.getByRole("button");
        expect(menuButton).toHaveClass("menu-open");
   });

   // check menu-open class when sidebar is closed 
   test("Should not add menu-open class when sidebar is closed",()=> {
        setup(
            {
                sidebarOpen: false,
            },
            {
                email : "datta@dmail.com"
            }
        );
       const menuButton = screen.getByRole("button");
       expect(menuButton).not.toHaveClass("menu-open");
   })
})