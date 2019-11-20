import React, { Component } from 'react';
import { Table, Row, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import moment from 'moment';
import swal from 'sweetalert';
import 'bootstrap/dist/css/bootstrap.css';
import './Home.scss';
import config from '../../constants/config';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      deleteModal: false,
      workItem: '',
      dueDate: '',
      resources: '',
      status: '',
      items: JSON.parse(localStorage.getItem('Items')),
      selectedIndex: '',
      modalType: ''
    }
  }


  toggle = () => {
    this.setState({ modal: !this.state.modal, modalType: 'Add', workItem: '',dueDate: '', resources: '', status: '' })
  }

  toggleDelete = (index) => {
    const id = index;
    this.setState({ deleteModal: !this.state.deleteModal, selectedIndex: id, modalType: 'Delete' })
  }

  toggleEdit = (index) => {
    const items = JSON.parse(localStorage.getItem('Items'));
    const seletedItem = items.filter((item, i) => {
      return (i+1) === index;
    });
    this.setState({ modal: !this.state.modal, selectedIndex: index, modalType: 'Edit', workItem: seletedItem[0].workItem, dueDate: seletedItem[0].dueDate, resources: seletedItem[0].resources, status: seletedItem[0].status})
  }

  handleItem = (value) => {
    this.setState({workItem:value});
  }

  handleDate = (value) => {
    this.setState({dueDate:value});
  }

  handleResources = (value) => {
    this.setState({resources:value});
  }

  handleStatus = (value) => {
    this.setState({status:value});
  }

  addItem = () => {
    const { workItem, dueDate, resources, status, modalType } = this.state;
    const data = {
      workItem: workItem,
      dueDate: dueDate,
      resources: resources,
      status: status
    }
    if(modalType === 'Edit'){
      const items = JSON.parse(localStorage.getItem('Items'));
      items.splice(this.state.selectedIndex-1, 1, data);
      localStorage.setItem('Items', JSON.stringify(items));
    }
    else{
      if(localStorage.getItem('Items')){
        const items = JSON.parse(localStorage.getItem('Items'));
        items.push(data);
        localStorage.setItem('Items', JSON.stringify(items));
      } else{
        const dataArray = [];
        dataArray.push(data);
        localStorage.setItem('Items', JSON.stringify(dataArray));
      }
    }
    this.toggle();
    this.setState({items : JSON.parse(localStorage.getItem('Items'))})
  }

  deleteItem = () => {
    const items = JSON.parse(localStorage.getItem('Items'));
    items.splice(this.state.selectedIndex-1, 1);
    localStorage.setItem('Items', JSON.stringify(items));
    this.setState({deleteModal: !this.state.deleteModal, selectedIndex: '', items : JSON.parse(localStorage.getItem('Items'))})
  }

  uploadToGoogleSpreadsheets = () => {
    let { items } = this.state
    const scriptURL = config.googleSpreadSheetURL;
    {
      for (var i = 0; i < items.length; i++) {
        var formData = new FormData();
        formData.append('Work Item', items[i].workItem);
        formData.append('Due Date', items[i].dueDate);
        formData.append('Resources', items[i].resources);
        formData.append('Status', items[i].status);
        fetch(scriptURL, { method: 'POST', body: formData })
          .then(response => swal("", "Items uploaded to Google Spreadsheets", "success"))
          .catch(error => console.error('Error!', error.message))
      }
    }
  }

  render() {
    const { modal, deleteModal, modalType, workItem, dueDate, resources, status, items, selectedIndex } = this.state;
    return (
      <div className="spreadSheet">
        <center>
            <h2 className="mb-2">Data Statistics</h2>
        </center>
        <div className="spread-box">
          <div className="spread-table">
            <Row className="header">
                <h4>Google Spread Sheet</h4>
                <h4>{`Number of work item: ${items ? items.length : 0}`}</h4>
            </Row>
            <Row className="header flex-end">
              <Button color="info" onClick={()=>this.uploadToGoogleSpreadsheets()}>Upload to Google SpreadSheet</Button>
              <Button color="info mr-0" onClick={this.toggle}>Add New Item</Button>
            </Row>
            <Table bordered>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>WorkItem</th>
                  <th>Due Date</th>
                  <th>No. Resources Needed</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {
                  items && items.length > 0 ? 
                  items.map((item, index) => {
                    return (
                      <tr>
                        <th scope="row">{index+1}</th>
                        <td>{item.workItem}</td>
                        <td>{moment(item.dueDate, "YYYY-MM-DD").format('Do MMM YYYY')}</td>
                        <td>{item.resources}</td>
                        <td>{item.status}</td>
                        <td>
                          <i className="fa fa-edit" onClick={()=>{this.toggleEdit(index+1)}}></i>
                          <i className="fa fa-trash trash-red" onClick={()=>{this.toggleDelete(index+1)}}></i>
                        </td>
                      </tr>
                    )
                  }) : null
                }
              </tbody>
            </Table>
          </div>
        </div>

        <Modal isOpen={modal} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle}>{`${modalType} item`}</ModalHeader>
          <ModalBody>
            <Form>
              <FormGroup>
                <Label for="item">WorkItem</Label>
                <Input type="text" name="item" id="item" placeholder="Item" value={workItem} onChange={(e)=>{this.handleItem(e.target.value)}}/>
              </FormGroup>
              <FormGroup>
                <Label for="date">Due Date</Label>
                <Input type="date" name="date" id="date" placeholder="Date" value={dueDate} onChange={(e)=>{this.handleDate(e.target.value)}}/>
              </FormGroup>
              <FormGroup>
                <Label for="number">No. of resources needed</Label>
                <Input type="number" name="resources" id="number" placeholder="Resources" value={resources} onChange={(e)=>{this.handleResources(e.target.value)}}/>
              </FormGroup>
              <FormGroup>
                <Label for="selectStatus">Select WorkItem Status</Label>
                <Input type="select" name="selectMulti" id="selectStatus" onChange={(e)=>{this.handleStatus(e.target.value)}} value={status}>
                  <option value='Overdue'>Overdue</option>
                  <option value='Done'>Done</option>
                  <option value='In progress'>In progress</option>
                </Input>
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.addItem}>Save</Button>
            <Button color="secondary" onClick={this.toggle}>Cancel</Button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={deleteModal} toggle={()=>{this.toggleDelete('')}} className={this.props.className}>
          <ModalHeader toggle={()=>{this.toggleDelete('')}} >{`${modalType} item`}</ModalHeader>
          <ModalBody>
            <p>{`Are yu sure you want to delete this Item ${selectedIndex}`} ?</p>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.deleteItem}>Delete</Button>
            <Button color="secondary" onClick={()=>{this.toggleDelete('')}} >Cancel</Button>
          </ModalFooter>
        </Modal>

      </div>
    );
  }  
}

export default Home;
