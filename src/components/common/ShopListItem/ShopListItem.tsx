import {apiCall} from "../../../utils/apiCall";
import {Button, Card, CardActions, CardContent, ListItemText} from "@mui/material";
import React from "react";
import {Items} from "../../../utils/reduceShoppingListRes";

interface Props {
    fetchList: () => void;
    item: Items;
}

export const ShopListItem = (props: Props) => {
    const {fetchList, item} = props
    const handleDelete = async (id: string) => {
        await apiCall(`/list/delete/${id}`, "DELETE");
        await fetchList();
    }
    return (
        <Card sx={{margin: "0 auto 10px", width: "500px", textAlign: "left"}}>
            <CardContent>
                <ListItemText primary={`${item.productName} - ${item.materialQuantity} ${item.unit}`}
                              secondary={`${item.materialCost} zł`}/>
            </CardContent>
            <CardActions>
                <Button onClick={() => handleDelete(item.id)}>Delete</Button>
            </CardActions>
        </Card>
    )
}
