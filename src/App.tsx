import React, {useState} from 'react';
import {Table} from './components/Table/Table';
import {IdContext} from "./contexts/IdContext";
import {Header} from "./components/layouts/Header/Header";
import './App.css';

function App() {
    const [contextId, setContextId] = useState('');

    return (
        <IdContext.Provider value={{contextId, setContextId}}>
                <Header/>
                <Table/>
        </IdContext.Provider>
    );
}

export default App;
