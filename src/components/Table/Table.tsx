import React, {ReactNode, SyntheticEvent, useContext, useEffect, useState} from 'react';
import {MaterialRecordEntity} from "types";
import {apiCall} from "../../utils/apiCall";
import {Link} from "react-router-dom";
import {IdContext} from "../../contexts/IdContext";
import Box from "@mui/material/Box";
import {DataGrid, GridColDef, GridRenderCellParams, GridRowId} from "@mui/x-data-grid";
import "./Table.css";


export function Table() {
    const [updateId, setUpdateId] = useState<string[]>([]);
    const contextId = useContext(IdContext);
    const [products, setProducts] = useState<MaterialRecordEntity[]>([]);

    const fetchMaterialRecords = async () => {
        const response = await apiCall("/");
        const data = await response.json();
        setProducts(data);
    };

    const deleteMaterial = async (e: SyntheticEvent, id: GridRowId) => {
        e.preventDefault();
        await apiCall(`/delete/${id}`, "DELETE");
        await fetchMaterialRecords();
    }

    const updatePrice = async (e: SyntheticEvent, id: string) => {
        e.preventDefault();
        setUpdateId(prevArr => [...prevArr, id]);
        const res = await apiCall(`/update/${id}`, "PATCH");
        if (res.ok) {
            setUpdateId(updateId => updateId.filter(arId => arId !== id));
            await fetchMaterialRecords();
        }
    }

    const firstLetterUpperCase = (s: string) => {
        return s.split(" ")
            .map((substring: string) => substring[0].toUpperCase() + substring.slice(1))
            .join(" ")
    }


    useEffect(() => {
        fetchMaterialRecords()
            .catch(console.error);
    }, [contextId]);


    const columns: GridColDef[] = [
        {field: "productGroup", headerName: "Product group", width: 200,},
        {field: "name", headerName: "Name", width: 100,},
        {
            field: "shopName", headerName: "Shop name", width: 100, renderCell: (params) => {
                let name: string;
                name = params.row.shopName === "leroymerlin" ? "Leroy Merlin" : params.row.shopName;
                return firstLetterUpperCase(name)
            }
        },
        {field: "previousPrice", headerName: "Previous price", width: 100,},
        {field: "currentPrice", headerName: "Current price", width: 100,},
        {field: "unit", headerName: "Unit", width: 100,},
        {
            field: "link", headerName: "Shop URL", width: 100, renderCell: (params) => {

                return <a href={params.row.link}>
                    <button>Go to shop</button>
                </a>
            }
        },
        {
            field: "actions", headerName: "Actions", width: 250, renderCell: (params: GridRenderCellParams): ReactNode => {
                return <>
                    <button onClick={e => deleteMaterial(e, params.row.id)}>Delete</button>
                    <button onClick={e => updatePrice(e, params.row.id)}>{updateId.includes(params.row.id) ? "Updating..." : "Update price"}</button>
                    <Link
                        to="/calculator"
                        state={
                            {
                                materialPrice: params.row.currentPrice,
                                name: params.row.name,
                                unit: params.row.unit,
                            }
                        }>
                        <button>Calculator</button>
                    </Link>
                </>
            }
        },
    ];

    const rows: MaterialRecordEntity[] = products.map(product => {
        return {
            id: product.id,
            productGroup: product.productGroup,
            name: product.name,
            shopName: product.shopName,
            previousPrice: product.previousPrice,
            currentPrice: product.currentPrice,
            unit: product?.unit,
            link: product.link,
        }
    });


    return (
        <>
            <Box sx={{height: 800, width: "100%"}}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={20}
                    rowsPerPageOptions={[20]}
                />
            </Box>
        </>

    )
}
