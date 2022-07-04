import React, {SyntheticEvent, useState} from "react";
import {config} from "../../config/config";
import {useLocation} from "react-router-dom";

interface Coordinates {
    coordinate1: string;
    coordinate2: string;
}

interface RowInfo {
    materialPrice: string;
    name: string;
    unit: string;
}

interface Costs {
    material: number | "";
    fuel: number | "";
    total: number | "";
}

export const Calculator = () => {
    const location = useLocation();
    const {materialPrice, name, unit} = location.state as RowInfo;
    const [costs, setCosts] = useState<Costs>({
        material: "",
        fuel: "",
        total: "",
    })
    const [form, setForm] = useState({
        address1: "",
        address2: "",
        gasPrice: "",
        fuelConsumption: "",
        materialQuantity: "",
        oneWay: "",
    });


    const getAddressData = async (address: string): Promise<any> => {
        const res = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=${config.openRouteServiceApiKey}&text=${address}`);
        return await res.json()
    }

    const getDistanceData = async (coordinates: Coordinates): Promise<any> => {
        const {coordinate1, coordinate2} = coordinates;
        const res = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=${config.openRouteServiceApiKey}&start=${coordinate1}&end=${coordinate2}`);
        return res.json();
    }

    const calculate = async (e: SyntheticEvent): Promise<any> => {
        const {address1, address2, gasPrice, fuelConsumption, materialQuantity, oneWay} = form;
        e.preventDefault();
        const add1 = await getAddressData(address1);
        const add2 = await getAddressData(address2);
        const coordinates =  {
            coordinate1: add1.features[0].geometry.coordinates.join(","),
            coordinate2: add2.features[0].geometry.coordinates.join(","),
        };
        const distanceData = await getDistanceData(coordinates);
        const distance = distanceData.features[0].properties.summary.distance / 1000;
        const fuelConsumptionCost = oneWay
            ? (Number(fuelConsumption) / (100 / distance)) * Number(gasPrice)
            : ((Number(fuelConsumption) / (100 / distance)) * Number(gasPrice)) * 2;
        const materialCost = Number(materialQuantity) * Number(materialPrice);
        const totalCost = fuelConsumptionCost + materialCost;
        setCosts({
            material: materialCost,
            fuel: fuelConsumptionCost,
            total: totalCost,
        })

    }

    const updateForm = (key: string, value: any) => {
        setForm(form => ({
            ...form,
            [key]: value,
        }))
    }

    return (
        <>
            <h1>{`Calculate total cost of buying ${name}`}</h1>
            <h3>{`Material price ${materialPrice}/${unit}`}</h3>
            <form onSubmit={calculate}>
                <label>Check to calculate for one way:
                    <input type="checkbox" name="oneWay" onChange={e => updateForm("oneWay", e.target.checked)}/>
                </label>
                <label>Address 1:
                    <input type="text" name="address1" value={form.address1} onChange={e => updateForm("address1", e.target.value)}/>
                </label>
                <label>Address 2:
                    <input type="text" name="address2" value={form.address2} onChange={e => updateForm("address2", e.target.value)}/>
                </label>
                <label>Price per liter of fuel:
                    <input type="text" name="gasPrice" value={form.gasPrice} onChange={e => updateForm("gasPrice", e.target.value)}/>
                </label>
                <label>Fuel consumption l/100km:
                    <input type="text" name="fuelConsumption" value={form.fuelConsumption} onChange={e => updateForm("fuelConsumption", e.target.value)}/>
                </label>
                <label>Material quantity:
                    <input type="text" name="materialQuantity" value={form.materialQuantity} onChange={e => updateForm("materialQuantity", e.target.value)}/>
                </label>
                <button>Calculate</button>
            </form>

            <p>Price of materials: {`${costs.material}`} </p>
            <p>Cost of fuel: {`${costs.fuel}`}</p>
            <p>Total with fuel costs: {`${costs.total}`}</p>
        </>
    )
}
