import React, {ReactNode, SyntheticEvent, useContext, useEffect, useState} from 'react';
import {MaterialRecordEntity} from "types";
import {apiCall} from "../../utils/apiCall";
import {IdContext} from "../../contexts/IdContext";
import Box from "@mui/material/Box";
import {DataGrid, GridColDef, GridRenderCellParams, GridRowId, GridSelectionModel} from "@mui/x-data-grid";
import Button from '@mui/material/Button'
import {Calculator} from "../Calculator/Calculator";
import {firstLetterUpperCase} from "../../utils/firstLetterUpperCase";
import DeleteIcon from '@mui/icons-material/Delete';
import UpdateIcon from '@mui/icons-material/Update';
import {LoadingButton} from "@mui/lab";
import SaveIcon from "@mui/icons-material/Save";

interface CalculatorProps {
    shopName: string;
    materialPrice: string;
    name: string;
    unit: string;
}

export function Table() {
    const contextId = useContext(IdContext);
    const [products, setProducts] = useState<MaterialRecordEntity[]>([]);
    const [selectedIds, setSelectedIds] = useState<GridSelectionModel>([]);
    const [selectedRow, setSelectedRow] = useState<CalculatorProps>({
        shopName: "",
        materialPrice: "",
        name: "",
        unit: "",
    });
    const [open, setOpen] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchMaterialRecords = async () => {
        const response = await apiCall("/");
        const data = await response.json();
        setProducts(data);
    };

    const handleOpenCalculator = (bool: boolean, rowData: any) => {
        setOpen(true);
        setSelectedRow({
            ...rowData
        })
    }

    const handleCloseCalculator = () => {
        setOpen(false);
        setSelectedRow({
            shopName: "",
            materialPrice: "",
            name: "",
            unit: "",
        })
    }


    const deleteSingleMaterial = async (id: GridRowId) => {
        await apiCall(`/delete/${id}`, "DELETE");
    }

    const deleteSelected = async (e: SyntheticEvent) => {
        e.preventDefault();
        setDeleteLoading(true);
        await Promise.all(
            selectedIds.map(async (id) => {
                await deleteSingleMaterial(id);
                setProducts(products.filter(product => product.id !== id));
                setSelectedIds([]);
            })
        )
        await fetchMaterialRecords();
        setDeleteLoading(false);
    }

    const updateSinglePrice = async (id: GridRowId) => {
        return await apiCall(`/update/${id}`, "PATCH");
    }

    const updateSelectedPrices = async (e: SyntheticEvent) => {
        e.preventDefault();
        setUpdateLoading(true);
        await Promise.allSettled(
            selectedIds.map(async (id) => {
                try {
                    const res = await updateSinglePrice(id);
                    if(res.status === 404) {
                        const productName = products.map(product => {
                            if(product.id === id) {
                                return product.name
                            }});
                        setError(`Cannot update price of ${productName}`);
                        setSelectedIds(selectedIds => selectedIds.filter(arrId => arrId !== id));
                        setUpdateLoading(false);
                        return
                    }
                    if (res.ok) {
                        setSelectedIds(selectedIds => selectedIds.filter(arrId => arrId !== id));
                        setError("");
                    }
                } catch (err) {
                    console.error(`Cannot update price of product with id: ${id}`, err);
                }
            })
        )
        await fetchMaterialRecords();
        setUpdateLoading(false);
    }


    const columns: GridColDef[] = [
        {field: "productGroup", headerName: "Product group", flex: 0.7,},
        {field: "name", headerName: "Name", flex: 2,},
        {
            field: "shopName", headerName: "Shop name", flex: 0.5, renderCell: (params) => {
                return firstLetterUpperCase(params.row.shopName)
            }
        },
        {field: "previousPrice", headerName: "Previous price", flex: 0.5,},
        {field: "currentPrice", headerName: "Current price", flex: 0.5,},
        {field: "unit", headerName: "Unit", flex: 0.2,},
        {
            field: "link", headerName: "Shop URL", flex: 0.5, renderCell: (params): ReactNode => {

                return <a href={params.row.link} target="_blank" rel="noopener noreferrer">
                    <Button variant="outlined" color="primary">Go to shop</Button>
                </a>
            }
        },
        {
            field: "action", headerName: "Calculate cost", flex: 0.5, renderCell: (params: GridRenderCellParams): ReactNode => {
                const selectedRowData = {
                    shopName: params.row.shopName,
                    materialPrice: params.row.currentPrice,
                    name: params.row.name,
                    unit: params.row.unit,
                }
                return <Button onClick={() => handleOpenCalculator(true, selectedRowData)} variant="outlined" color="primary">Calculator</Button>
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
            <Calculator open={open} onClose={handleCloseCalculator} selectedRow={selectedRow}/>
            <div style={{backgroundColor: "#d3d9de"}}>
                <div style={{display: "flex", justifyContent: "center", padding: "10px 0"}}>
                    <LoadingButton sx={{marginRight: "10px"}}
                                   variant="outlined"
                                   color="error"
                                   startIcon={<DeleteIcon/>}
                                   onClick={e => deleteSelected(e)}
                                   size="medium"
                                   loading={deleteLoading}
                                   loadingPosition="start">Delete selected
                    </LoadingButton>
                    <LoadingButton sx={{marginRight: "10px"}}
                                   variant="outlined"
                                   color="primary"
                                   onClick={e => updateSelectedPrices(e)}
                                   size="medium"
                                   loading={updateLoading}
                                   loadingPosition="start"
                                   startIcon={<UpdateIcon/>}>{updateLoading ? "Updating..." : "Update selected"}
                    </LoadingButton>
                    {error && <p>{`${error}`}</p>}
                </div>
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
            </div>
        </>
    )
}
