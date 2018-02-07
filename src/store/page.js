import React from 'react'
import { action, useStrict, extendObservable } from 'mobx'
import TableModel from '../models/tableModel'
import API from '../api'
useStrict(true)

const highPriority = '#f4ba61'
const medPriority = '#f4e261'

const projectColumns = [
  {
    Header: 'ID',
    accessor: 'id',
    filterable: true
  },
  {
    Header: 'Created',
    accessor: 'dateCreated'
  },
  {
    Header: 'Title',
    accessor: 'title'
  },
  {
    id: 'customerName', // Required because our accessor is not a string
    Header: 'Customer Name',
    accessor: d => d.customer.name
  },
  {
    id: 'costCenter', // Required because our accessor is not a string
    Header: 'Cost Center',
    accessor: d => d.costCenter.title
  },
  {
    Header: 'Time Spent',
    accessor: 'timeSpent'
  },
  {
    Header: 'Finished',
    accessor: 'dateFinished'
  },
  {
    Header: 'Status',
    accessor: 'status',
    filterable: true,
    Cell: row => (
      <span>
        {/* TODO: adjust this to be accurate for values of fn*/}
        <span style={{
          color: row.value === 'Closed' ? '#ff2e00'
            : row.value === '?' ? '#ffbf00'
            : '#57d500',
          transition: 'all .3s ease'}}>
            &#x25cf;
        </span>
        {row.value}
      </span>
    ),
    filterMethod: (filter, row) => {
      if (filter.value === 'all') {
        return true
      }
      if (filter.value === 'true') {
        {/* TODO: adjust this to be accurate for values of fn*/}
        return row[filter.id] == 'Open'
      }
      {/* TODO: adjust this to be accurate for values of fn*/}
      return row[filter.id] != 'Open'
    },
    Filter: ({ filter, onChange }) =>
      <select
        onChange={event => onChange(event.target.value)}
        style={{ width: '100%' }}
        value={filter ? filter.value : 'all'}
      >
        <option value="all">Show All</option>
        <option value="true">Open</option>
        <option value="false">Closed</option>
      </select>
  },
]

const customerColumns = [
  {
    Header: 'ID',
    accessor: 'id',
    filterable: true
  },
  {
    Header: 'Name',
    accessor: 'name'
  },
  {
    Header: 'Shipping Address',
    accessor: 'formattedShipAddress'
  },
  {
    Header: 'Billing Address',
    accessor: 'formattedBillAddress'
  },
  {
    Header: 'Phone',
    accessor: 'phone'
  },
]

const employeeColumns = [
  {
    Header: 'ID',
    accessor: 'id'
  },
  {
    Header: 'Name',
    accessor: 'name'
  },
  {
    Header: 'Barcode',
    accessor: 'barcode'
  },
]

/**
 * @name Page
 * @class Page
 * @classdesc Main MobX store for page
 * @property {Boolean} [loggedin=false] Indicates whether currently logged in [observable]
 * @property {String} [title='Default Title'] Page title [observable]
 * @property {String} [navHighlight=''] Sidebar option highlighted [observable]
 * @property {Object} [content=null] Page inner content [observable]
 * @property {Array} [buttons=[]] Page inner content buttons [observable]
 */
class Page {
  constructor() {
    let addtlProps = {
      loggedin: true,
      title: 'Default Title',
      navHighlight: '',
      content: null,
      tableModel: null,
      formData: null,
      buttons: [],
    }
    extendObservable(this, addtlProps)
  }

  /*
  Page will house all of the sidebar "change page" functions
  Each function will set title, content, tableModel, buttons, and navHighlight
  If page requires a table, table model should be initialized
  All fetch functions should "modelize" returned data into appropriate models (this file will import models from folder)
   */

  fetchFn(){
    console.log('fetchFn')
    return true
  }

  // Page Changes - Projects

  @action createNewProjMenuItem(){
    this.title = 'New Project'
    this.content = <p>A form!</p>
    this.tableModel = null
    this.formData = null
    this.buttons = []
  }

  /**
   * @name selectCustomerPage
   * @description Updates title, tableModel, content, buttons, and navHighlight for Select Customer page.
   * @memberof Page.prototype
   * @method selectCustomerPage
   * @mobx action
   */
  @action selectCustomerPage(){
    this.title = 'Select Customer'
    // Button, fetchFn, rowSelectFn, columns
    this.tableModel = new TableModel(
      {
        title: 'New Customer',
        onClick: () => this.newCustomerPage()
      },
      API.fetchCustomers,
      () => console.log('rowSelectFn'),
      customerColumns
    )
    this.content = null
    this.formData = null
    this.buttons = []
    this.navHighlight = 'Create New Project'
  }

  /**
   * @name newCustomerPage
   * @description Updates title, tableModel, content, buttons, and navHighlight for New Customer page.
   * @memberof Page.prototype
   * @method newCustomerPage
   * @mobx action
   */
  @action newCustomerPage(){
    this.title = 'New Customer'
    this.tableModel = null
    this.content = null
    this.formData = {
      fields: [
        {
          type: 'textfield',
          label: 'Company Name',
          id: 'companyName'
        },
        {
          type: 'textfield',
          label: 'Phone Number',
          id: 'phoneNumber'
        },
        {
          type: 'checkbox',
          label: 'Same As Shipping',
          id: 'sameAsShipping'
        }
      ],
      primaryButton: {
        title: 'Continue',
        onClick: () => console.log('onClick')
      },
      secondaryButton: {
        title: 'Cancel',
        onClick: () => console.log('onClick')
      }
    }
    this.buttons = []
  }

  /**
   * @name projectsMenuItem
   * @description Updates table, titleModel, content, buttons, and navHighlight for Projects page
   * @method projectsMenuItem
   * @memberof Page.prototype
   * @mobx action
   */
  @action projectsMenuItem(){
    this.title = 'Projects'
    // Button, fetchFn, rowSelectFn, columns, rowSelectModal, styling
    this.tableModel = new TableModel(
      null,
      API.fetchProjects,
      () => console.log('rowSelectFn'),
      projectColumns,
      null,
      // TODO: make sure comparison is accurate to priority types
      (state, rowInfo) => {
        if (rowInfo && rowInfo.row._original.priority != 'low'){
          return {
            style: {
              background: rowInfo.row._original.priority == 'high' ? highPriority : medPriority
            }
          }
        }
        return {}
      }
    )
    this.content = null
    this.formData = null
    this.buttons = []
  }

  /**
   * @name projectTimeEntryMenuItem
   * @description Updates title, tableModel, content, buttons, and navHighlight for Project Time Entry page.
   * @memberof Page.prototype
   * @method projectTimeEntryMenuItem
   * @mobx action
   */
  @action projectTimeEntryMenuItem(){
    this.title = 'Time Entry'
    this.content = <h1>insert various fields</h1>
    this.tableModel = null
    this.formData = null
    this.buttons = []
  }

  /**
   * @name customerInfoMenuItem
   * @description Updates title, tableModel, content, buttons, and navHighlight for Customer Information page.
   * @memberof Page.prototype
   * @method customerInfoMenuItem
   * @mobx action
   */
  @action customerInfoMenuItem(){
    this.title = 'Customer Information'
    this.tableModel = new TableModel(
      {
        title: 'New Customer',
        onClick: () => this.newCustomerPage()
      },
      API.fetchCustomers,
      () => console.log('rowSelectFn'),
      customerColumns
    )
    this.content = null
    this.formData = null
    this.buttons = []
    //click a customer name and model pops up with "Projects" modal
  }

  // Page Changes - Analytics

  /**
   * @name emplProductivityMenuItem
   * @description Updates title, tableModel, content, buttons, and navHighlight for Employee Productivity page.
   * @memberof Page.prototype
   * @method emplProductivityMenuItem
   * @mobx action
   */
  @action emplProductivityMenuItem(){
    this.title = 'Employee Productivity [Q3]'
    this.formData = null
    this.tableModel = null
    this.content = <h1>insert analysis and graph</h1>
    this.buttons = []
  }

  /**
   * @name workstationTrackingMenuItem
   * @description Updates title, tableModel, content, buttons, and navHighlight for Workstation Tracking page.
   * @memberof Page.prototype
   * @method workstationTrackingMenuItem
   * @mobx action
   */
  @action workstationTrackingMenuItem(){
    this.title = 'Workstation Tracking [Q3]'
    this.formData = null
    this.tableModel = null
    this.content = <h1>insert analysis and graph</h1>
    this.buttons = []
  }

  /**
   * @name jobTypeProductivityMenuItem
   * @description Updates title, tableModel, content, buttons, and navHighlight for Job Type Productivity page.
   * @memberof Page.prototype
   * @method jobTypeProductivityMenuItem
   * @mobx action
   */
  @action jobTypeProductivityMenuItem(){
    this.title = 'Job Type Productivity [Q3]'
    this.formData = null
    this.tableModel = null
    this.content = <h1>insert analysis and graph</h1>
    this.buttons = []
  }

  /**
   * @name costCenterTimeMenuItem
   * @description Updates title, tableModel, content, buttons, and navHighlight for Cost Center Time page.
   * @memberof Page.prototype
   * @method costCenterTimeMenuItem
   * @mobx action
   */
  @action costCenterTimeMenuItem(){
    this.title = 'Cost Center Time [Q3]'
    this.formData = null
    this.tableModel = null
    this.content = <h1>insert analysis and graph</h1>
    this.buttons = []
  }

  // Page Changes - Admin

  /**
   * @name employeeInformationMenuItem
   * @description Updates title, tableModel, content, buttons, and navHighlight for Employee Information page.
   * @memberof Page.prototype
   * @method employeeInformationMenuItem
   * @mobx action
   */
  @action employeeInformationMenuItem(){
    this.title = 'Employee Information'
    this.formData = null
    this.tableModel = null
    this.content = <h1>insert analysis and graph</h1>
    this.buttons = []
  }

  /**
   * @name accountManagementMenuItem
   * @description Updates title, tableModel, content, buttons, and navHighlight for Account Management page.
   * @memberof Page.prototype
   * @method accountManagementMenuItem
   * @mobx action
   */
  @action accountManagementMenuItem(){
    this.title = 'Account Management [Q3]'
    this.formData = null
    this.tableModel = null
    this.content = <h1>insert analysis and graph</h1>
    this.buttons = []
  }


  // TODO remove
  @action changeLogin(){
    this.loggedin = !this.loggedin
    this.createNewProjMenuItem()
  }
}

const page = new Page()
export default page
