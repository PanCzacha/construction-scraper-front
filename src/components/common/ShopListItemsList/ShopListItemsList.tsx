import React from 'react';
import {ReduceShoppingListRes} from "../../../utils/reduceShoppingListRes";
import {firstLetterUpperCase} from "../../../utils/firstLetterUpperCase";
import {Grid, List} from "@mui/material";
import {ShopListItem} from "../ShopListItem/ShopListItem";

interface Props {
    listObj: ReduceShoppingListRes;
    fetchList: () => void;
}

export const ShopListItemsList = (props: Props) => {
    const {fetchList, listObj} = props;
    return (
        <Grid item xs={4}>
            <div style={{textAlign: "center"}} key={listObj.shopAddress}>
                <h1>{firstLetterUpperCase(listObj.shopName)}</h1>
                <h2>{listObj.shopAddress}</h2>
                <List>
                    {
                        listObj.items.map(item => {
                            return (
                                <ShopListItem key={item.id} fetchList={fetchList} item={item}/>
                            )
                        })
                    }
                </List>
            </div>
        </Grid>
    )
}
