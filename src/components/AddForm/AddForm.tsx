import React, {SyntheticEvent, useContext, useState} from "react";
import {apiCall} from "../../utils/apiCall";
import {IdContext} from "../../contexts/IdContext";

export const AddForm = () => {
    const {setContextId} = useContext(IdContext);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        productGroup: "",
        link: "",
    })

    const addMaterial = async (e: SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await apiCall("/add", "POST", {
                productGroup: form.productGroup,
                link: form.link,
            });
            const id = res.json();
            setForm({
                productGroup: "",
                link: "",
            })
            setContextId(id);
        } finally {
            setLoading(false);
        }

    }

    if(loading) {
        return (
            <h1>Adding... Please wait.</h1>
        )
    }


    const updateForm = (key: string, value: any) => {
        setForm(form => ({
            ...form,
            [key]: value,
        }))
    }

    return (
        <form action="" className="add-form" onSubmit={addMaterial}>
            <h1>Add construction material to database</h1>
            <p>
            <label>
                Product group:
                <br/>
                <input type="text"
                name="productGroup"
                required
                maxLength={49}
                value={form.productGroup}
                onChange={e => updateForm("productGroup", e.target.value)}/>
            </label>
            </p>
            <p>
                <label>
                    URL to shop:
                    <br/>
                    <input type="text"
                           name="link"
                           required
                           maxLength={299}
                           value={form.link}
                           onChange={e => updateForm("link", e.target.value)}/>
                </label>
            </p>
            <button>Add</button>
        </form>
    )
}
