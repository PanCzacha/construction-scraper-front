import React, {SyntheticEvent, useContext, useState} from "react";
import {apiCall} from "../../utils/apiCall";
import {IdContext} from "../../contexts/IdContext";
import SaveIcon from '@mui/icons-material/Save';
import {FormGroup, TextField} from "@mui/material";
import {LoadingButton} from "@mui/lab";

export const AddForm = () => {
    const {setContextId} = useContext(IdContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        link: "",
        productGroup: "",
    })

    const addMaterial = async (e: SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await apiCall("/add", "POST", {
                link: form.link,
                productGroup: form.productGroup,
            });

            if(!res.ok) {
                setForm({
                    link: "",
                    productGroup: "",
                })
                throw res
            }

            const id = res.json();
            setContextId(id);
            if(error !== "") {
                setError("");
            }
            setForm({
                link: "",
                productGroup: "",
            })

        } catch (err: any) {
            const data = await err.json();
            setError(data.message);
        } finally {
            setLoading(false);
        }

    }

    const handleChangeForm = (key: string, value: any) => {
        setForm(form => ({
            ...form,
            [key]: value,
        }))
    }

    return (
        <div style={{height: "200px"}}>
            <form onSubmit={addMaterial}>
                <h1 style={{textAlign: "center", fontSize: "30px"}}>Construction Buddy </h1>
                <FormGroup row>
                    <TextField
                        sx={{marginLeft: "10px"}}
                        type="text"
                        name="productGroup"
                        required
                        label="Product group"
                        inputProps={{
                            maxLength: 49,
                        }}
                        value={form.productGroup}
                        onChange={e => handleChangeForm("productGroup", e.target.value)}/>
                    <TextField
                        sx={{marginLeft: "10px", width: "600px"}}
                        type="text"
                        name="link"
                        required
                        label="Valid URL to shop"
                        helperText={error ? `${error}` : "Must be URL from OBI, Castorama or Leroy Merlin"}
                        inputProps={{
                            minLength: 3,
                            maxLength: 299,
                        }}
                        value={form.link}
                        onChange={e => handleChangeForm("link", e.target.value)}/>
                    <LoadingButton
                        sx={{marginLeft: "10px"}}
                        type="submit"
                        size="medium"
                        loading={loading}
                        loadingPosition="start"
                        variant="contained"
                        startIcon={<SaveIcon/>}
                    >
                        Add to list
                    </LoadingButton>
                </FormGroup>
            </form>
        </div>
    )
}
