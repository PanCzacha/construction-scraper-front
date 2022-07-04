import React, {useState} from 'react';
import {Table} from './components/Table/Table';
import {IdContext} from "./contexts/IdContext";
import {Route, Routes} from "react-router-dom";
import {Header} from "./components/Header/Header";
import {Calculator} from "./components/Calculator/Calculator";
import './App.css';

function App() {
    const [contextId, setContextId] = useState('');
    // const context = useMemo(() => ({contextId, setContextId}), [contextId]);

    return (
        <IdContext.Provider value={{contextId, setContextId}}>
            <Header/>
            <Routes>
                <Route path="/" element={<Table/>}/>
                <Route path="/calculator" element={<Calculator/>}/>
            </Routes>
        </IdContext.Provider>
    );
}

export default App;
