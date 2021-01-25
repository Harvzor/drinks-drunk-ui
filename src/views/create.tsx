import React from 'react';

import { Api, Item } from "../api"

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import Skeleton from '@material-ui/lab/Skeleton';

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
    const [loading, setLoading] = React.useState(true)
    const [items, setItems] = React.useState([])
    const [itemName, setItemName] = React.useState('')
    const [itemColour, setItemColour] = React.useState('')

    const classes = useStyles()

    const api = new Api()

    console.log('load')

    const loadAndRenderItems = () => {
        api.listItems()
            .then((returnedItems) => {
                setItems(returnedItems)

                setLoading(false)
            })
    }

    React.useEffect(() => {
        loadAndRenderItems()
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        api.createItem(itemName, itemColour)
            .then(() => {
                loadAndRenderItems()
            })
    }

    return (
        <>
            <h1>Create</h1>
            <form className={classes.root} onSubmit={handleSubmit}>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                        <TableBody>
                        {loading
                            ? <>
                                { [...Array(10)].map((_, index) =>
                                    <TableRow key={index}>
                                        <TableCell component="th" scope="row">
                                            <Skeleton key={index} />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </>
                            : <>
                                {items.map((item: Item) => (
                                    <TableRow key={item.id}>
                                        <TableCell component="th" scope="row">
                                            <span style={{ color: item.colour }}>
                                                { item.name }
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span>
                                                { item.colour }
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell component="th" scope="row">
                                        <TextField name="itemName" value={itemName} onChange={e => setItemName(e.target.value)} label="Name" variant="outlined" />
                                    </TableCell>
                                    <TableCell>
                                        <TextField name="itemColour" value={itemColour} onChange={e => setItemColour(e.target.value)} label="Colour" variant="outlined" />
                                        <Button variant="contained" color="primary" type="submit">
                                            Submit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </>
                        }
                        </TableBody>
                    </Table>
                </TableContainer>
            </form>
        </>
    )
}