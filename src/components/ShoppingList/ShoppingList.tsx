import React, {useEffect, useState} from "react";
import {reduceShoppingListRes, ReduceShoppingListRes} from "../../utils/reduceShoppingListRes";
import {ShopListItem} from "../common/ShopListItem/ShopListItem";
import {Button, Divider, Stack} from "@mui/material";
import {apiCall} from "../../utils/apiCall";

interface Props {
    open: boolean;
    close: () => void;
    startPoint: string;
}

export const ShoppingList = (props: Props) => {
    const {open, close, startPoint} = props;
    const [list, setList] = useState<ReduceShoppingListRes[]>([]);

    const fetchList = async () => {
        const res = await apiCall("/list");
        const data = await res.json();
        const listData = reduceShoppingListRes(data);
        setList(listData);
    }

    useEffect(() => {
        fetchList().catch(err => console.error(err));
    }, [])


    return (
        <>
            <div style={{backgroundColor: "#d3d9de", height: "calc(100vh - 200px)"}}>
                <div style={{display: "flex", justifyContent: "center"}}>
                <Button sx={{margin: "0 auto"}} onClick={() => close()}>Close</Button>
                <Button sx={{margin: "0 auto"}} >Delete all</Button>
                </div>
                <h1 style={{margin: "0 0 10px", textAlign: "center"}}>Lista zakupów</h1>
                <Stack justifyContent="center"
                       alignItems="center"
                       direction="row">
                    {
                        list.map(listObj => {
                            return <ShopListItem listObj={listObj} fetchList={fetchList}/>
                        })
                    }
                </Stack>
            </div>
        </>

    )
}
