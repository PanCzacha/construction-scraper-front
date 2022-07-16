import { ListRecordEntity } from "types";

export type Items = Omit<ListRecordEntity, "shopAddress" | "shopName">

export interface ReduceShoppingListRes {
    shopName: string;
    items: Items[];
    shopAddress: string;
}

export const reduceShoppingListRes = (list: ListRecordEntity[]) => {
    return list.reduce((acc: ReduceShoppingListRes[], curr: ListRecordEntity) => {
        let index = acc.findIndex(item => item.shopAddress === curr.shopAddress);
        if (index !== -1) {
            acc[index].shopAddress = curr.shopAddress
            acc[index].shopName = curr.shopName
            acc[index].items = Array.isArray(acc[index].items)
                ? [...acc[index].items, {id: curr.id, productName: curr.productName, materialCost: curr.materialCost, materialQuantity: curr.materialQuantity, unit: curr.unit}]
                : [{id: curr.id, productName: curr.productName, materialCost: curr.materialCost, materialQuantity: curr.materialQuantity, unit: curr.unit}]
        } else {
            acc = acc.concat({
                shopAddress: curr.shopAddress,
                shopName: curr.shopName,
                items: [{id: curr.id, productName: curr.productName, materialCost: curr.materialCost, materialQuantity: curr.materialQuantity, unit: curr.unit}],
            });
        }
        return acc
    }, []);
}
