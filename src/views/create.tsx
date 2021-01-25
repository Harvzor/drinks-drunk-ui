import React from 'react';

import { Api, Item } from "../api"

import { withStyles, WithStyles, makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import Skeleton from '@material-ui/lab/Skeleton';

const useStyles = theme => createStyles({
    root: {
        '& > div': {
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1),
        },
    },
})

class CreateState {
    loading: boolean
    items: Item[]
    itemName: string
    itemColour: string
}

interface Props extends WithStyles<typeof useStyles>{ }

class Create extends React.Component<Props> {
    state: CreateState = {
        loading: true,
        items: [],
        itemName: '',
        itemColour: '',
    }
    api = new Api()
    loadAndRenderItems() {
        this.api.listItems()
            .then((returnedItems) => {
                this.setState({ items: returnedItems, loading: false })
            })
    }
    handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        console.log(this)

        this.setState({ loading: true })

        this.api.createItem(this.state.itemName, this.state.itemColour)
            .then(() => {
                this.loadAndRenderItems()
            })
    }
    componentDidMount() {
        this.loadAndRenderItems()
    }
    render() {
        const { classes } = this.props;

        return (
            <>
                <h1>Create</h1>
                <form className={classes.root} onSubmit={this.handleSubmit}>
                    <TableContainer component={Paper}>
                        <Table aria-label="simple table">
                            <TableBody>
                            {this.state.loading
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
                                    {this.state.items.map((item: Item) => (
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
                                            <TextField name="itemName" value={this.state.itemName} onChange={e => this.setState({ itemName: e.target.value})} label="Name" variant="outlined" />
                                        </TableCell>
                                        <TableCell>
                                            <TextField name="itemColour" value={this.state.itemColour} onChange={e => this.setState({itemColour: e.target.value})} label="Colour" variant="outlined" />
                                            <Button variant="contained" color="primary" type="submit">
                                                Add new item
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
}

export default withStyles(useStyles)(Create)
