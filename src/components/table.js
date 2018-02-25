import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import TableButton from './tableButton'
import DeleteModal from './deleteModal'

@inject ('page') @observer
export default class Table extends Component {
  constructor(props){
    super(props)
    this.filter = this.filter.bind(this)
  }

  filter(filter, row){
    const id = filter.pivotId || filter.id
    return (row[id] !== undefined) ? String(row[id]).includes(filter.value) : false
  }

  render() {
    /* Page sizing customization
    defaultPageSize={14}
    pageSizeOptions={[5, 10, 20, 25, 50, 100]}
    */

    // If onClick function for rows, redefine onClick for table elements and call function
    let rowSelect = {}
    if (this.props.page.tableModel.rowSelectFn){
      rowSelect = {
        getTdProps: (state, rowInfo) => {
          return {
            onClick: (e, handleOriginal) => {
              if (rowInfo){
                console.log('It was in this row:', rowInfo)
                this.props.page.tableModel.rowSelectFn(rowInfo)
              }
              if (handleOriginal) {
                handleOriginal()
              }
            }
          }
        },
      }
    }
    let rowModal = null
    // If modal to be opened when row clicked, declare in render and redefine onClick for table elements and call open modal
    if (this.props.page.tableModel.deleteModal){
      rowModal = (
        <DeleteModal
          title={this.props.page.tableModel.deleteModal.title}
          confirmOnClick={this.props.page.tableModel.confirmAndClose}
          denyOnClick={this.props.page.tableModel.closeModal}
          open={this.props.page.tableModel.modalOpen}
          closeFn={this.props.page.tableModel.closeModal}
          content={this.props.page.tableModel.deleteModal.content}
        />
      )
    }
    let rowStyling = null
    if (this.props.page.tableModel.styling){
      rowStyling = {
        getTrProps: (state, rowInfo, column) => {
          return this.props.page.tableModel.styling(state, rowInfo, column)
        }
      }
    }
    let buttonContent = null
    if (this.props.page.tableModel.tableButton){
      buttonContent =
        (<div>
          <TableButton
            title={this.props.page.tableModel.tableButton.title}
            onClick={this.props.page.tableModel.tableButton.onClick}
          />
        </div>)
    }
    return (
      <div>
      {buttonContent}
      {rowModal}
      <div style={{clear: 'both'}}>
        <ReactTable
          data={this.props.page.tableModel.data.slice()}
          columns={this.props.page.tableModel.columns}
          loading={this.props.page.tableModel.loading}
          defaultFilterMethod={this.filter}
          {...rowSelect}
          {...rowStyling}
        />
      </div>
      </div>
    )

  }
}
