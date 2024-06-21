import { createContext, useContext, useState } from "react";

export const CategoriesContext = createContext();

export const useCategoriesContext = () => {
    return useContext(CategoriesContext);
}

export const CategoriesContextProvider = ({children}) => {
    const [authUser, setAuthUser] = useState();

    return (
        <CategoriesContext.Provider value={{ authUser, setAuthUser }}>
            {children}
        </CategoriesContext.Provider>
    );
}