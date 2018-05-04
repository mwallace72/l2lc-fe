import { action, computed, useStrict, extendObservable } from 'mobx'
import autoBind from 'auto-bind'
import Consts from '../consts'
useStrict(true)

/**
 * @name ProjectModel
 * @class ProjectModel
 * @classdesc Project storage object
 * @property {Number} id Database ID
 * @property {String} descr Description of project
 * @property {Object} costCenterTitle Cost center title [observable]
 * @property {String} jobTypeTitle Job type title [observable]
 * @property {String} title Project title [observable]
 * @property {String} priority Project priority [observable]
 * @property {String} status Project status [observable]
 * @property {?Number} [partCount=null] Project part count [observable]
 * @property {?String} [descr=null] Project description [observable]
 * @property {?String} [refNum=null] Project internal reference number [observable]
 * @property {Customer} [customer={}] Project Customer (defaults to empty object for table display) [observable]
 * @property {?Date} [dateCreated=null] Project date created
 * @property {?Date} [dateFinished=null] Project date finished [observable]
 * @property {String} [processArea=''] Project last process area [observable]
 * @property {Object} [hold] Hold object [observable]
 * @property {Boolean} hold.flag Hold indicator (true: on hold) [observable]
 * @property {String} hold.descr Hold description [observable]
 * @property {Object[]} [reworks=[]] Array of objects containing rework date created and description [observable]
 * @property {Object[]} [timeEntries=[]] Array of objects containing related database employee ID, related database station ID, and date created [observable]
 * @property {Task[]} [tasks=[]] Array of Task(s) associated with Project [observable]
 * @property {String} [historyMsg=''] Time entry history message for Project [observable]
 */
export default class ProjectModel {
  constructor(id, costCenterTitle, jobTypeTitle, title, priority, status, dateCreated=null, partCount=null, descr=null, refNum=null, customer, dateFinished=null) {
    let addtlProps = {
      costCenterTitle, // changeable?
      jobTypeTitle, // changeable?
      title,
      priority,
      status,
      // Optional
      partCount,
      descr,
      refNum,
      dateFinished,
      customer,
      // Defaults
      processArea: '',
      hold: {
        flag: false,
        descr: ''
      },
      reworks: [],
      timeEntries: [],
      tasks: [],
      historyMsg: '',
    }
    if(!customer)
      addtlProps.customer = {}
    if (dateFinished)
      addtlProps.dateFinished = new Date(dateFinished)
    extendObservable(this, addtlProps)
    // Non-observable (don't change)
    this.id = id
    this.dateCreated = dateCreated
    if (dateCreated)
      this.dateCreated = new Date(dateCreated)
    autoBind(this)
  }

  // Computations

  /**
   * @name customerID
   * @description Gets this.customer.id, if any
   * @memberof ProjectModel.prototype
   * @method customerID
   * @return {(Number|null)}
   * @mobx computed
   */
  @computed get customerID(){
    if (this.customer) return this.customer.id
    else return null
  }
  /**
   * @name timeSpent
   * @description Calculates Project's time total based on timeEntries
   * @memberof ProjectModel.prototype
   * @method timeSpent
   * @return {String}
   * @mobx computed
   */
  @computed get timeSpent(){
    let {hour, min} = Consts.calculateTime(this.timeEntries)
    return `${(hour != 0) ? `${hour} hour${(hour > 1) ? 's' : '' }, ` : ''}${(min != 0) ? `${min} minute${(min > 1) ? 's' : ''}`: ''}`
  }
  /**
   * @name isOpen
   * @description Projects with null dateFinished have not been closed
   * @method isOpen
   * @memberof ProjectModel.prototype
   * @return {Boolean}
   * @mobx computed
   */
  @computed get isOpen(){
    return (this.dateFinished == null)
  }
  /**
   * @name barcodeDomID
   * @description Return the DOM computed ID for a barcode field, specific to the project
   * @method barcodeDomID
   * @return {String}
   * @memberof EmployeeModel.prototype
   * @mobx computed
   */
  @computed get barcodeDomID(){
    return `project${this.id}`
  }
  /**
   * @name barcodeScanID
   * @description Returns the ID to encode in the barcode for scanning purposes
   * @method barcodeScanID
   * @return {String}
   * @memberof EmployeeModel.prototype
   * @mobx computed
   */
  @computed get barcodeScanID(){
    return `p${this.id}%`
  }

  // Actions

  /**
   * @name changeCustomer
   * @description Sets this.customer, makes request to API to modify Project's related Customer
   * @memberof ProjectModel.prototype
   * @method changeCustomer
   * @param  {Customer}       customer new Customer to link to Project
   * @return {Promise}
   * @mobx action
   */
  @action changeCustomer(customer){
    this.customer = customer
  }

  /**
   * @name finish
   * @description Sets this.status
   * @memberof ProjectModel.prototype
   * @method finish
   * @mobx action
   */
  @action finish(){
     this.status = 'Completed'
   }
  /**
   * @name toggleTask
   * @description Call's Task's toggle
   * @memberof ProjectModel.prototype
   * @method toggleTask
   * @param  {Task}   task Task to toggle required status of
   * @return {Promise}
   * @mobx action
   */
  @action toggleTask(task){
     console.log('Call\'s Task\'s toggle method')
   }

  /**
  * @name addTask
  * @description Calls API to update task list in database; sets this.tasks
  * @memberof ProjectModel.prototype
  * @method addTask
  * @param  {String}  title         New task title
  * @param  {String}  [processArea] New task associated process area, if any
  * @return {Promise}
  * @mobx action
  */
  @action addTask(title, processArea){
    //console.log(`Adds task to project in API with title: ${title}${(processArea) ? `and process area: ${processArea}` : ''}`)
  }
  /**
  * @name removeTask
  * @description Calls API to update task list in database; sets this.tasks
  * @memberof ProjectModel.prototype
  * @method removeTask
  * @param  {Task}   task Task to remove
  * @return {Promise}
  * @mobx action
  */
  @action removeTask(task){
    console.log('Removes task in project in API')
  }
}
