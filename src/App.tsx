import React, {SyntheticEvent, useEffect, useState} from 'react';
import './App.css';
import {Table} from './components/Table/Table';
import {CellValue, Column} from "react-table";
import {MaterialRecordEntity} from 'types';
import {apiCall} from "./utils/apiCall";
import {AddForm} from "./components/AddForm/AddForm";
import {IdContext} from "./contexts/IdContext";

function App() {
    const [updateId, setUpdateId] = useState<string[]>([]);
    const [contextId, setContextId] = useState('');
    const [products, setProducts] = useState<MaterialRecordEntity[]>([]);

    const fetchMaterialRecords = async () => {
        const response = await apiCall("/");
        const data = await response.json();
        setProducts(data);
    };

    const deleteMaterial = async (e: SyntheticEvent, id: string) => {
        e.preventDefault();
        await apiCall(`/delete/${id}`, "DELETE");
        await fetchMaterialRecords();
    }

    const updatePrice = async (e: SyntheticEvent, id: string) => {
        e.preventDefault();
        setUpdateId(prevArr => [...prevArr, id]);
        const res = await apiCall(`/update/${id}`, "PATCH");
        if(res.ok) {
            setUpdateId(updateId => updateId.filter(arId => arId !== id));
            await fetchMaterialRecords()
        }
    }

    const calculate = async (e: SyntheticEvent, id: string): Promise<number> => {
        return 10
    }

    const firstLetterUpperCase = (s: CellValue) => {
        return s.split(" ")
            .map((substring: string) => substring[0].toUpperCase() + substring.slice(1))
            .join(" ")
    }

    const columns: Column[] = [
        {
            Header: "Id",
            accessor: "id",
        },
        {
            Header: "Product group",
            accessor: "productGroup",
        },
        {
            Header: "Name",
            accessor: "name",
        },
        {
            Header: "Shop name",
            accessor: "shopName",
            Cell: ({row}) => {
                let name: string;
                name = row.values.shopName === "leroymerlin" ? "leroy merlin" : row.values.shopName;
                return firstLetterUpperCase(name)
            }

        },
        {
            Header: "Previous price",
            accessor: "previousPrice",
        },
        {
            Header: "Current price",
            accessor: "currentPrice"
        },
        {
            Header: "Shop URL",
            accessor: "link",
            Cell: ({row}) => {
                return (
                    <a href={`${row.values.link}`}>Go to shop</a>
                )
            }
        },
        {
            Header: "Actions",
            Cell: ({row}) => {
                return (
                    <div>
                        <button
                            onClick={(e) => deleteMaterial(e, row.values.id)}>
                            Delete
                        </button>
                        <button
                            onClick={e => updatePrice(e, row.values.id)}>
                            {updateId.includes(row.values.id) ? "Updating..." : "Update price"}
                        </button>
                        <button
                            onClick={e => calculate(e, row.values.id)}>
                            {"Calculate cost"}
                        </button>
                    </div>
                )
            }
        }

    ];

    const data: MaterialRecordEntity[] = products;

    useEffect(() => {
        fetchMaterialRecords()
            .catch(console.error);
    }, [contextId]);

    return (
        <IdContext.Provider value={{contextId, setContextId}}>
            <AddForm/>
            <Table columns={columns} data={data}/>
        </IdContext.Provider>
    );
}

export default App;
