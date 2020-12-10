import React from 'react';

import { Api, Item } from "../api"

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            '& > div': {
                marginTop: theme.spacing(1),
                marginBottom: theme.spacing(1),
            },
        },
    }),
)

export function Create() {
    const [itemName, setItemName] = React.useState('')
    const [itemColour, setItemColour] = React.useState('')

    const classes = useStyles()

    const api = new Api()

    const handleSubmit= (e: React.FormEvent) => {
        e.preventDefault()

        api.createItem(itemName, itemColour)
    }

    return (
        <>
            <h1>Create</h1>
            <form className={classes.root} onSubmit={handleSubmit}>
                <div>
                    <TextField name="itemName" value={itemName} onChange={e => setItemName(e.target.value)} label="Name" variant="outlined" />
                </div>
                <div>
                    <TextField name="itemColour" value={itemColour} onChange={e => setItemColour(e.target.value)} label="Colour" variant="outlined" />
                </div>
                <div>
                    <Button variant="contained" color="primary" type="submit">
                        Submit
                    </Button>
                </div>
            </form>
        </>
    )
}