import React, {MutableRefObject, SyntheticEvent, useEffect, useRef, useState} from "react";
import {config} from "../../config/config";
import {apiCall} from "../../utils/apiCall";
import {
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControlLabel,
    FormGroup,
    MenuItem,
    Switch,
    TextField
} from "@mui/material";
import Button from "@mui/material/Button";

interface Props {
    open: boolean;
    onClose: () => void,
    selectedRow: {
        shopName: string;
        materialPrice: number;
        name: string;
        unit: string;
    }
    setStartLastAddress: React.Dispatch<React.SetStateAction<string>>;
    startLastAddress: string;
}

interface Costs {
    material: number;
    fuel: number;
    total: number;
}

interface FormData {
    distance: string;
    gasPrice: number;
    fuelConsumption: number;
    materialQuantity: number;
    oneWay: boolean;
    useLast: boolean;
}

interface ShopDistanceMatrix {
    address: string;
    distance: string;
}
interface Focusable {
    focus: () => void
}


export const Calculator = (props: Props) => {

    const {shopName, materialPrice, name, unit} = props.selectedRow;
    const {open, onClose, setStartLastAddress, startLastAddress} = props;
    const [costs, setCosts] = useState<Costs>({
        material: 0,
        fuel: 0,
        total: 0,
    })
    const [form, setForm] = useState<FormData>({
        distance: "",
        gasPrice: 0,
        fuelConsumption: 0,
        materialQuantity: 0,
        oneWay: false,
        useLast: false,
    });
    const [startAddress, setStartAddress] = useState("");
    const [shopDistances, setShopDistances] = useState<ShopDistanceMatrix[] | null>(null);
    const [shopAddress, setShopAddress] = useState("");
    const [toggleDisable, setToggleDisable] = useState(true);
    const [toggleInsertDisable, setToggleInsertDisable] = useState(true);
    const [error, setError] = useState("");
    const useLastAddress = useRef<Focusable>(null)

    const handleClose = () => {
        setForm({
            distance: "",
            gasPrice: 0,
            fuelConsumption: 0,
            materialQuantity: 0,
            oneWay: false,
            useLast: false,
        });
        setCosts({
            material: 0,
            fuel: 0,
            total: 0,
        });
        setShopDistances(null);
        setStartAddress("");
        setToggleDisable(true);
        setToggleInsertDisable(true);
        setError("");
        onClose();
    }

    const handleInsertShopListItem = async () => {
        const listItem = {
            shopAddress: shopAddress,
            shopName: shopName,
            productName: name,
            materialQuantity: form.materialQuantity,
            materialCost: costs.material,
            unit: unit,
        }
        await apiCall("/list", "POST", listItem);
    }


    const handleCalcFormChange = (key: string, value: any) => {
        setForm(form => ({
            ...form,
            [key]: value,
        }))
    }

    const handleStartAddressFormChange = (value: string) => {
        if (value === "") {
            setShopDistances(null);
            setCosts({
                material: 0,
                fuel: 0,
                total: 0,
            });
            setError("");
        }
        setStartAddress(value);

    }

    const handleLastAddressUse = () => {
        if(startLastAddress !== "") {
            setStartAddress(startLastAddress)
        }
        if (useLastAddress.current != null) {
            useLastAddress.current.focus();
        }
    }

    const getShopsDistances = async (e: SyntheticEvent) => {
        e.preventDefault();
        try {
            const startCoordinates = await getStartPointCoordinates();
            const res = await apiCall(`/shops/distances/${shopName}/${startCoordinates}`);
            const data = await res.json();
            setShopDistances(data);
            setToggleDisable(false);
        } catch (err: any) {
            setError(err.message);
        }

    }

    const getStartPointCoordinates = async () => {
        setStartLastAddress(startAddress);
        const res = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=${config.openRouteServiceApiKey}&text=${startAddress}`);
        const data = await res.json();
        if (!data.features[0]) {
            throw new Error("Cannot find address. Please provide valid address.");
        }
        setError("");
        return data.features[0].geometry.coordinates.join(",");
    }

    const calculate = async (e: SyntheticEvent): Promise<void> => {
        e.preventDefault();
        const {distance, gasPrice, fuelConsumption, materialQuantity, oneWay} = form;
        const fuelConsumptionCost: number = oneWay
            ? fuelConsumption / (100 / Number(distance)) * gasPrice
            : (fuelConsumption / (100 / Number(distance)) * gasPrice) * 2;
        const materialCost: number = Number(materialQuantity) * Number(materialPrice);
        const totalCost: number = fuelConsumptionCost + materialCost;

        setCosts({
            material: Number(materialCost.toFixed(2)),
            fuel: Number(fuelConsumptionCost.toFixed(2)),
            total: Number(totalCost.toFixed(2)),
        })
        setToggleInsertDisable(false);
    }

    useEffect(() => {
        if (shopDistances && shopDistances.length > 0) {
            const sorted = shopDistances.sort((a, b) => (a.distance > b.distance) ? 1 : ((b.distance > a.distance) ? -1 : 0))
            handleCalcFormChange("distance", String(sorted[0].distance));
            setShopAddress(sorted[0].address);
        }
    }, [shopDistances])

    return (
        <Dialog
            open={open}
        >
            <DialogTitle>Calculate</DialogTitle>
            <DialogContent sx={{minWidth: "500px"}}>
                <>
                    <DialogContentText>Calculate total cost of buying:</DialogContentText>
                    <DialogContentText><strong>{`${name}`}</strong></DialogContentText>
                    <form onSubmit={getShopsDistances}>
                        <FormGroup sx={{display: "flex", justifyContent: "space-evenly"}} row>
                            <TextField sx={{marginLeft: "10px", marginTop: "20px", width: "300px"}}
                                       label="Provide starting point and hit Enter"
                                       type="text"
                                       name="startAddress"
                                       value={startAddress}
                                       inputRef={useLastAddress}
                                       onChange={e => handleStartAddressFormChange(e.target.value)}
                                       helperText={error && error}/>
                            <FormControlLabel
                                sx={{marginTop: "20px"}}
                                label="One way?"
                                control={<Switch name="oneWay"
                                                 checked={form.oneWay}
                                                 onChange={e => handleCalcFormChange("oneWay", e.target.checked)}
                                />}
                            />
                            <Button sx={{marginTop: "10px"}} disabled={startLastAddress === ""} onClick={() => handleLastAddressUse()}>Use last address</Button>
                        </FormGroup>
                    </form>
                    <form onSubmit={calculate}>
                        <FormGroup sx={{width: "100%"}}>
                            {shopDistances && <TextField
                              name="distance"
                              disabled={toggleDisable}
                              select
                              required
                              onChange={(e) => handleCalcFormChange("distance", e.target.value)}
                              value={form.distance}
                              label="Select shop"
                              sx={{marginTop: "10px"}}
                              helperText="Click to select"
                            >
                                {[...shopDistances]
                                    .sort((a, b) => (a.distance > b.distance) ? 1 : ((b.distance > a.distance) ? -1 : 0))
                                    .map((shop: ShopDistanceMatrix) => {
                                        return <MenuItem key={shop.address}
                                                         onClick={() => setShopAddress(shop.address)}
                                                         value={shop.distance}>{shop.address} {shop.distance}km</MenuItem>
                                    })}
                            </TextField>}
                            <TextField sx={{marginTop: "20px"}}
                                       variant="outlined"
                                       disabled={toggleDisable}
                                       label="Fuel price - liter"
                                       type="number"
                                       name="gasPrice"
                                       value={form.gasPrice === 0 ? "" : form.gasPrice}
                                       onChange={e => handleCalcFormChange("gasPrice", e.target.value)}/>
                            <TextField sx={{marginTop: "20px"}}
                                       variant="outlined"
                                       disabled={toggleDisable}
                                       label="Fuel consumption l/100km"
                                       type="number"
                                       name="fuelConsumption"
                                       value={form.fuelConsumption === 0 ? "" : form.fuelConsumption}
                                       onChange={e => handleCalcFormChange("fuelConsumption", e.target.value)}/>

                            <TextField sx={{marginTop: "20px"}}
                                       required
                                       variant="outlined"
                                       disabled={toggleDisable}
                                       label="Material quantity"
                                       type="number"
                                       name="materialQuantity"
                                       helperText={`Item price is ${materialPrice} zł/ ${unit}`}
                                       value={form.materialQuantity === 0 ? "" : form.materialQuantity}
                                       onChange={e => handleCalcFormChange("materialQuantity", e.target.value)}/>
                        </FormGroup>
                        <Button sx={{position: "relative", marginTop: "20px", left: "50%", transform: "translateX(-50%)"}}
                                type="submit"
                                variant="contained"
                                size="large"
                        >Calculate</Button>
                    </form>
                    {costs.total === 0
                        ? null
                        : <div style={{marginTop: "20px", textAlign: "center"}}>
                            <DialogContentText sx={{fontSize: "22px"}}>Cost of materials: {`${costs.material}`} zł </DialogContentText>
                            <DialogContentText sx={{fontSize: "22px"}}>Cost of fuel: {`${costs.fuel}`} zł</DialogContentText>
                            <DialogContentText sx={{fontSize: "22px"}}>Total: <strong>{`${costs.total}`}</strong> zł</DialogContentText>
                        </div>
                    }
                </>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleInsertShopListItem()} disabled={toggleInsertDisable}>Add to shopping list</Button>
                <Button onClick={() => handleClose()}>Close</Button>
            </DialogActions>
        </Dialog>
    )
}
