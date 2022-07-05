import React, {ReactNode, SyntheticEvent, useContext, useEffect, useState} from 'react';
import {MaterialRecordEntity} from "types";
import {apiCall} from "../../utils/apiCall";
import {Link} from "react-router-dom";
import {IdContext} from "../../contexts/IdContext";
import Box from "@mui/material/Box";
import {DataGrid, GridColDef, GridRenderCellParams, GridRowId, GridSelectionModel} from "@mui/x-data-grid";
import "./Table.css";


export function Table() {
    const contextId = useContext(IdContext);
    const [products, setProducts] = useState<MaterialRecordEntity[]>([]);
    const [updateId, setUpdateId] = useState<GridRowId[]>([]);
    const [selectedIds, setSelectedIds] = useState<GridSelectionModel>([]);

    const fetchMaterialRecords = async () => {
        const response = await apiCall("/");
        const data = await response.json();
        setProducts(data);
    };

    const deleteSingleMaterial = async (id: GridRowId) => {
        await apiCall(`/delete/${id}`, "DELETE");
    }

    const deleteSelected = async (e: SyntheticEvent) => {
        e.preventDefault();
        await Promise.allSettled(
            selectedIds.map(async (id) => {
                await deleteSingleMaterial(id);
                setProducts(products.filter(product => product.id !== id));
                setSelectedIds([]);
            })
        )
        await fetchMaterialRecords();

    }

    const updateSinglePrice = async (id: GridRowId) => {
        setUpdateId(prevArr => [...prevArr, id]);
        return await apiCall(`/update/${id}`, "PATCH")
    }

    const updateSelectedPrices = async (e: SyntheticEvent) => {
        e.preventDefault();
        await Promise.allSettled(
            selectedIds.map(async (id) => {
                const res = await updateSinglePrice(id);
                if (res.ok) {
                    setUpdateId(updateId => updateId.filter(arId => arId !== id));
                    setSelectedIds([]);
                }
            })
        )
        await fetchMaterialRecords();
    }

    const firstLetterUpperCase = (s: string) => {
        return s.split(" ")
            .map((substring: string) => substring[0].toUpperCase() + substring.slice(1))
            .join(" ")
    }


    const columns: GridColDef[] = [
        {field: "productGroup", headerName: "Product group", width: 200,},
        {field: "name", headerName: "Name", flex: 2,},
        {
            field: "shopName", headerName: "Shop name", flex: 1, renderCell: (params) => {
                let name: string;
                name = params.row.shopName === "leroymerlin" ? "Leroy Merlin" : params.row.shopName;
                return firstLetterUpperCase(name)
            }
        },
        {field: "previousPrice", headerName: "Previous price", flex: 0.5,},
        {field: "currentPrice", headerName: "Current price", flex: 0.5,},
        {field: "unit", headerName: "Unit", flex: 0.3,},
        {
            field: "link", headerName: "Shop URL", width: 100, renderCell: (params) => {

                return <a href={params.row.link}>
                    <button>Go to shop</button>
                </a>
            }
        },
        {
            field: "action", headerName: "Calculate cost", flex: 1, renderCell: (params: GridRenderCellParams): ReactNode => {
                return <>
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

    useEffect(() => {
        fetchMaterialRecords()
            .catch(console.error);
    }, [contextId]);

    return (
        <>
            <button onClick={e => deleteSelected(e)}>Delete selected</button>
            <button onClick={e => updateSelectedPrices(e)}>{updateId.length > 0 ? "Updating..." : "Update price of selected"}</button>
            <div style={{width: "100%"}}>
                <div style={{display: "flex", height: "800px", width: "100%"}}>
                    <Box sx={{width: "100%", flexGrow: 1}}>
                        <DataGrid
                            autoHeight
                            rows={rows}
                            columns={columns}
                            pageSize={20}
                            rowsPerPageOptions={[20]}
                            checkboxSelection
                            disableSelectionOnClick
                            onSelectionModelChange={(id) => setSelectedIds(id)}
                            selectionModel={selectedIds}
                        />
                    </Box>
                </div>
            </div>
        </>

    )
}
