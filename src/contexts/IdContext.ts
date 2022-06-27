import {createContext} from "react";

export const IdContext = createContext({
    contextId: "",
    setContextId: (s: string) => {},
})
