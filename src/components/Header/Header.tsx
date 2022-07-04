import React from "react";
import { Link } from "react-router-dom";
import {AddForm} from "../AddForm/AddForm";
import "./Header.css";

export const Header = () => {

    return (
        <header>
            <h1>
                <Link to="/"><button>Home</button></Link>
            </h1>
            <AddForm/>
        </header>
    )

}
