import { beforeEach, describe,test,vi, } from "vitest";
import { render,screen } from "@testing-library/react";
import { UserContext } from "../../Context/UserContext";
import { loginUser, checkEmailExists } from "../../authApi/authApi";
import { useNavigate } from "react-router-dom";
import Login from "./Login";

vi.mock("../../authApi/authApi", ()=> ({
    loginUser: vi.fn(),
    checkEmailExists: vi.fn()
}));

// react toastify success message
vi.mock("react-toastify",()=> ({
    toast : {
        success : vi.fn()
    }
}));
// navigate after success toastr message
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async()=> {
    const actual = await vi.importActual("react-router-dom")
    return {
        ...actual,
        useNavigate: ()=> mockNavigate
    }
});

const renderLogin=()=> {
    const setLoggedInUser = vi.fn();
    render(
         <UserContext.Provider value={{setLoggedInUser}}>
            <MemoryRouter>
                <Login/>
            </MemoryRouter>
         </UserContext.Provider>
    )
   return {setLoggedInUser}
}

describe("Login Component",()=> {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    test("should render the login step",()=> {
        
    })
})