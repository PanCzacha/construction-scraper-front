import React, {SyntheticEvent, useEffect, useState} from "react";
import {config} from "../../config/config";
import {apiCall} from "../../utils/apiCall";
import {firstLetterUpperCase} from "../../utils/firstLetterUpperCase";

interface RowInfo {
    shopName: string;
    materialPrice: string;
    name: string;
    unit: string;
}

interface Costs {
    material: string | "";
    fuel: string | "";
    total: string | "";
}

interface FormData {
    distance: string;
    gasPrice: string;
    fuelConsumption: string;
    materialQuantity: string;
    oneWay: boolean;
}

interface ShopDistanceMatrix {
    address: string;
    distance: string;
}

export const Calculator = (props: RowInfo) => {
    const {shopName, materialPrice, name, unit} = props;

    const [costs, setCosts] = useState<Costs>({
        material: "",
        fuel: "",
        total: "",
    })

    const [form, setForm] = useState<FormData>({
        distance: "",
        gasPrice: "",
        fuelConsumption: "",
        materialQuantity: "",
        oneWay: false,
    });
    const [startAddress, setStartAddress] = useState("");
    const [shopDistances, setShopDistances] = useState<ShopDistanceMatrix[] | null>(null);

    const getShopsDistances = async (e: SyntheticEvent) => {
        e.preventDefault();
        const startCoordinates = await getStartPointCoordinates();
        const res = await apiCall(`/shops/distances/${shopName}/${startCoordinates}`)
        const data = await res.json();
        setShopDistances(data);
    }

    const getStartPointCoordinates = async () => {
        const res = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=${config.openRouteServiceApiKey}&text=${startAddress}`);
        const data = await res.json();
        return data.features[0].geometry.coordinates.join(",");
    }

    const calculate = async (e: SyntheticEvent): Promise<void> => {
        e.preventDefault();
        const {distance, gasPrice, fuelConsumption, materialQuantity, oneWay} = form;
        const fuelConsumptionCost = oneWay
            ? (Number(fuelConsumption) / (100 / Number(distance))) * Number(gasPrice)
            : ((Number(fuelConsumption) / (100 / Number(distance))) * Number(gasPrice)) * 2;
        const materialCost = Number(materialQuantity) * Number(materialPrice);
        const totalCost = fuelConsumptionCost + materialCost;
        setCosts({
            material: materialCost.toFixed(2),
            fuel: fuelConsumptionCost.toFixed(2),
            total: totalCost.toFixed(2),
        })
    }

    const updateCalcForm = (key: string, value: any) => {
        setForm(form => ({
            ...form,
            [key]: value,
        }))
    }

    const updateStartAddressForm = (value: string) => {
        if (value === "") {
            setShopDistances(null);
        }
        setStartAddress(value);
    }

    useEffect(() => {
        if(shopDistances && shopDistances.length > 0) {
            const sorted = shopDistances.sort((a,b) => (a.distance > b.distance) ? 1 : ((b.distance > a.distance) ? -1 : 0))
            updateCalcForm("distance", String(sorted[0].distance));
        }
    }, [shopDistances])

    return (
        <>
            <h1>{`Calculate total cost of buying ${name}`}</h1>
            <h3>{`Material price ${materialPrice}/${unit}`}</h3>
            <form onSubmit={getShopsDistances}>
                <label>Please enter your starting address and click "Enter"
                    <input type="text" name="startAddress" value={startAddress} onChange={e => updateStartAddressForm(e.target.value)}/>
                </label>
                <button>Enter</button>
            </form>

            <form onSubmit={calculate}>
                <p>
                    <label>Check to calculate for one way:
                        <input type="checkbox" name="oneWay" onChange={e => updateCalcForm("oneWay", e.target.checked)}/>
                    </label>
                </p>
                <p>

                    {shopDistances === null
                        ? null
                        : <label>
                            Select <strong>{`${firstLetterUpperCase(shopName)}`}</strong> shop
                            <select name="distance" onChange={(e) => updateCalcForm("distance", e.target.value)}>
                                {[...shopDistances]
                                    .sort((a,b) => (a.distance > b.distance) ? 1 : ((b.distance > a.distance) ? -1 : 0))
                                    .map((shop: ShopDistanceMatrix) => {
                                        return <option key={shop.distance} value={shop.distance}>{shop.address} {shop.distance}km</option>
                                    })}
                            </select>
                        </label>
                    }
                </p>
                <p>
                    <label>Price per liter of fuel:
                        <input type="text" name="gasPrice" value={form.gasPrice} onChange={e => updateCalcForm("gasPrice", e.target.value)}/>
                    </label>
                </p>
                <p>
                    <label>Fuel consumption l/100km:
                        <input type="text" name="fuelConsumption" value={form.fuelConsumption}
                               onChange={e => updateCalcForm("fuelConsumption", e.target.value)}/>
                    </label>
                </p>
                <p>
                    <label>Material quantity:
                        <input type="text" name="materialQuantity" value={form.materialQuantity}
                               onChange={e => updateCalcForm("materialQuantity", e.target.value)}/>
                    </label>
                </p>
                <button>Calculate</button>
            </form>

            <p>Cost of materials: {`${costs.material}`} zł </p>
            <p>Cost of fuel: {`${costs.fuel}`} zł</p>
            <p>Total: <strong>{`${costs.total}`}</strong> zł</p>

        </>
    )
}
