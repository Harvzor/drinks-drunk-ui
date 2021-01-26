import React from 'react';

import { Api, Item } from "../api"

import { withStyles, WithStyles, createStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableBody';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Modal from '@material-ui/core/Modal';

import Skeleton from '@material-ui/lab/Skeleton';

const useStyles = theme => createStyles({
    root: {
        '& > div': {
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1),
        },
    },
    modal: {
        position: 'absolute',
        width: '400px',
        top: '50%',
        left: '50%',
        padding: theme.spacing(2, 4, 3),
        transform: 'translate(-50%, -50%)',
        '& button': {
            width: '100%',
        }
    },
})

class CreateState {
    loading: boolean
    items: Item[]
    itemName: string
    itemColour: string
    createModalOpen: boolean
}

interface Props extends WithStyles<typeof useStyles>{ }

class Create extends React.Component<Props> {
    state: CreateState = {
        loading: true,
        items: [],
        itemName: '',
        itemColour: '',
        createModalOpen: false,
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
                this.setState({ createModalOpen: false })
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
                <h1>Manage trackables</h1>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <b>Name</b>
                                </TableCell>
                                <TableCell>
                                    <b>Colour</b>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.loading
                                ? <>
                                    { [...Array(10)].map((_, index) =>
                                        <TableRow key={index}>
                                            <TableCell component="th">
                                                <Skeleton key={index} />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton key={index} />
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </>
                                : <>
                                    {this.state.items.map((item: Item) => (
                                        <TableRow key={item.id}>
                                            <TableCell component="th">
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
                                </>
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
                <br />
                <Button variant="contained" color="primary" type="submit" onClick={e => { e.preventDefault(); this.setState({ createModalOpen: true }) }}>
                    Add new trackable
                </Button>
                <Modal open={this.state.createModalOpen} onClose={e => this.setState({ createModalOpen: false })}>
                    <Paper className={classes.modal}>
                        <form className={classes.root} onSubmit={this.handleSubmit}>
                            <div>
                                <TextField name="itemName" value={this.state.itemName} onChange={e => this.setState({ itemName: e.target.value })} label="Name" helperText="Give it helpful name so you know what you're tracking" variant="outlined" />
                            </div>
                            <div>
                                <TextField name="itemColour" value={this.state.itemColour} onChange={e => this.setState({ itemColour: e.target.value })} label="Colour" helperText="Give it a colour which matches what it is. E.g. eating vegetables might be brown, drinking orange juice could be orange. The colour value can be an HTML colour name, RGB or hex value." variant="outlined" />
                            </div>
                            <div>
                                <Button variant="contained" color="primary" type="submit">
                                    Add trackable
                                </Button>
                            </div>
                        </form>
                    </Paper>
                </Modal>
            </>
        )
    }
}

export default withStyles(useStyles)(Create)
