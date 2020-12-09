import React from 'react';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            '& .MuiTextField-root': {
                margin: theme.spacing(1),
            },
        },
    }),
)

export function Create() {
    const [itemName, setItemName] = React.useState(null)

    const classes = useStyles()

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        // this.setState({
        //     [name]: value
        // })

        // Todo: use generic code
        setItemName(value)
    }

    const handleSubmit= (e: React.FormEvent) => {
        e.preventDefault()

        console.log(this.state)
    }

    return (
        <>
            <h1>Create</h1>
            <form className={classes.root} onSubmit={handleSubmit}>
                <TextField name="itemName" value={itemName} onChange={handleChange} label="Item name" variant="outlined" />
                <div>
                    <Button variant="contained" color="primary" type="submit">
                        Submit
                    </Button>
                </div>
            </form>
        </>
    )
}