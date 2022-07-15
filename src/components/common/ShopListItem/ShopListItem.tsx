import React from 'react';
import {ReduceShoppingListRes} from "../../../utils/reduceShoppingListRes";
import {firstLetterUpperCase} from "../../../utils/firstLetterUpperCase";
import {Button, Card, CardActions, CardContent, List, ListItemText} from "@mui/material";
import {apiCall} from "../../../utils/apiCall";

interface Props {
    listObj: ReduceShoppingListRes;
    fetchList: () => void;
}

export const ShopListItem = (props: Props) => {
    const {fetchList} = props;

    const handleDelete = async (id: string) => {
        await apiCall(`/list/delete/${id}`, "DELETE");
        await fetchList();
    }


    const {listObj} = props;
    return (
        <>
            <div style={{textAlign: "center", width: "800px"}} key={listObj.shopAddress}>
                <h1>{firstLetterUpperCase(listObj.shopName)}</h1>
                <List>
                    {
                        listObj.items.map(item => {
                            return (
                                <Card sx={{margin: "0 auto 10px", width: "500px", textAlign: "left"}} key={item.id}>
                                    <CardContent>
                                        <ListItemText primary={`${item.productName} - ${item.materialQuantity} ${item.unit}`}
                                                      secondary={`${item.materialCost} zł`}/>
                                    </CardContent>
                                    <CardActions>
                                        <Button onClick={() => handleDelete(item.id)}>Delete</Button>
                                    </CardActions>
                                </Card>
                            )
                        })
                    }
                </List>
            </div>
        </>
    )
}
