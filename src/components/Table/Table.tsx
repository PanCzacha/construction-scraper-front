import React, {ReactNode, SyntheticEvent, useContext, useEffect, useState} from 'react';
import {MaterialRecordEntity} from "types";
import {apiCall} from "../../utils/apiCall";
import {IdContext} from "../../contexts/IdContext";
import Box from "@mui/material/Box";
import {DataGrid, GridColDef, GridRenderCellParams, GridRowId, GridSelectionModel} from "@mui/x-data-grid";
import "./Table.css";
import {Calculator} from "../Calculator/Calculator";
import {firstLetterUpperCase} from "../../utils/firstLetterUpperCase";


export function Table() {
    const contextId = useContext(IdContext);
    const [products, setProducts] = useState<MaterialRecordEntity[]>([]);
    const [updateId, setUpdateId] = useState<GridRowId[]>([]);
    const [selectedIds, setSelectedIds] = useState<GridSelectionModel>([]);
    const [selectedRow, setSelectedRow] = useState({
        shopName: "",
        materialPrice: "",
        name: "",
        unit: "",
    })
    const [calculate, setCalculate] = useState(false);

    const handleOpenCalculator = (bool: boolean, rowData?: any) => {
        if (!bool) {
            setSelectedRow({
                shopName: "",
                materialPrice: "",
                name: "",
                unit: "",
            })
        }
        setCalculate(bool);
        setSelectedRow({
            ...rowData
        })
    }

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
        await Promise.all(
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
        return await apiCall(`/update/${id}`, "PATCH");
    }

    const updateSelectedPrices = async (e: SyntheticEvent) => {
        e.preventDefault();
        await Promise.allSettled(
            selectedIds.map(async (id) => {
                try {
                    const res = await updateSinglePrice(id);
                    if (res.ok) {
                        setUpdateId(updateId => updateId.filter(arrId => arrId !== id));
                        setSelectedIds(selectedIds => selectedIds.filter(arrId => arrId !== id));
                    }
                } catch (err) {
                    console.error(`Cannot update price of product with id: ${id}`, err);
                }
            })
        )
        await fetchMaterialRecords();
    }


    const columns: GridColDef[] = [
        {field: "productGroup", headerName: "Product group", width: 200,},
        {field: "name", headerName: "Name", flex: 2,},
        {
            field: "shopName", headerName: "Shop name", flex: 1, renderCell: (params) => {
                return firstLetterUpperCase(params.row.shopName)
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
                const selectedRowData = {
                    shopName: params.row.shopName,
                    materialPrice: params.row.currentPrice,
                    name: params.row.name,
                    unit: params.row.unit,
                }
                return <button onClick={() => handleOpenCalculator(true, selectedRowData)}>Calculator</button>
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
            {calculate
                ?
                <div>
                    <Calculator name={selectedRow.name} shopName={selectedRow.shopName} materialPrice={selectedRow.materialPrice}
                                unit={selectedRow.unit}/>
                    <button onClick={() => handleOpenCalculator(false)}>Close</button>
                </div>
                :
                <div>
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
                </div>}
        </>

    )
}
