import React, {SyntheticEvent, useContext, useState} from "react";
import {apiCall} from "../../utils/apiCall";
import {IdContext} from "../../contexts/IdContext";
import SaveIcon from '@mui/icons-material/Save';
import {FormGroup, Input, InputLabel, TextField} from "@mui/material";
import {LoadingButton} from "@mui/lab";

export const AddForm = () => {
    const {setContextId} = useContext(IdContext);
    const [loading, setLoading] = useState(false);
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
            const id = res.json();
            setForm({
                link: "",
                productGroup: "",
            })
            setContextId(id);
        } finally {
            setLoading(false);
        }

    }

    const updateForm = (key: string, value: any) => {
        setForm(form => ({
            ...form,
            [key]: value,
        }))
    }

    return (
        <form onSubmit={addMaterial}>
            <h1 style={{textAlign: "center", fontSize: "30px"}}>Add construction material to database</h1>
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
                    onChange={e => updateForm("productGroup", e.target.value)}/>
                <TextField
                    sx={{marginLeft: "10px"}} type="text"
                    name="link"
                    required
                    label="Valid URL to shop"
                    helperText="Must be URL from OBI, Castorama or Leroy Merlin"
                    inputProps={{
                        maxLength: 299,
                    }}
                    value={form.link}
                    onChange={e => updateForm("link", e.target.value)}/>
            <LoadingButton
                sx={{marginLeft: "10px"}}
                type="submit"
                size="medium"
                loading={loading}
                loadingPosition="start"
                variant="contained"
                startIcon={<SaveIcon />}
            >
                Add to Database
            </LoadingButton>
            </FormGroup>
        </form>
    )
}
