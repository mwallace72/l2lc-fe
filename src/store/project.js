import { action, computed, useStrict, extendObservable } from 'mobx'
useStrict(true)

/**
 * @name Project
 * @class Project
 * @description Main MobX store for website
 * @property {Number} id database ID [observable]
 * @property {Object} costCenter Related cost center object [observable]
 * @property {Object} costCenter.id ID [observable]
 * @property {Object} costCenter.title Title [observable]
 * @property {Object} costCenter.descr Description [observable]
 * @property {Object} jobType Related job type (within cost center) [observable]
 * @property {Number} jobType.id ID [observable]
 * @property {String} jobType.title Title [observable]
 * @property {Number} jobType.costCenterID Related cost center ID [observable]
 * @property {String} title Project title [observable]
 * @property {String} priority Project priority [observable]
 * @property {Number} [partCount=null] Project part count [observable]
 * @property {String} [descr=null] Project description [observable]
 * @property {String} [refNum=null] Project internal reference number [observable]
 * @property {Customer} [customer=null] Project Customer [observable]
 * @property {Date} [dateCreated=null] Project date created [observable]
 * @property {Date} [dateFinished=null] Project date finished [observable]
 * @property {String} [processArea=''] Project last process area [observable]
 * @property {Object} [hold] Hold object [observable]
 * @property {Boolean} hold.flag Hold indicator (true: on hold) [observable]
 * @property {String} hold.descr Hold description [observable]
 * @property {Object[]} [reworks=[]] Array of objects containing rework date created and description [observable]
 * @property {Object[]} [timeEntries=[]] Array of objects containing related database employee ID, related database station ID, and date created [observable]
 * @property {Task[]} [tasks=[]] Array of Task(s) associated with Project [observable]
 * @property {String} [historyMsg=''] Time entry history message for Project [observable]
 */
class Project {
  constructor(id, costCenter, jobType, title, priority, dateCreated, partCount, descr, refNum, customer, dateFinished) {
    let addtlProps = {}
    addtlProps.id = id
    addtlProps.costCenter = costCenter
    addtlProps.jobType = jobType
    addtlProps.title = title
    addtlProps.priority = priority
    // Optional
    addtlProps.partCount = partCount
    addtlProps.descr = descr
    addtlProps.refNum = refNum
    // TODO: initialize Customer object?
    addtlProps.customer = null
    addtlProps.dateCreated = null
    if (dateCreated)
      addtlProps.dateCreated = new Date(dateCreated)
    addtlProps.dateFinished = null
    if (dateFinished)
      addtlProps.dateFinished = new Date(dateFinished)
    // Defaults
    addtlProps.processArea = ''
    addtlProps.hold = {
      flag: false,
      descr: ''
    }
    addtlProps.reworks = []
    addtlProps.timeEntries = []
    addtlProps.tasks = []
    addtlProps.historyMsg = ''
    extendObservable(this, addtlProps)
  }

  // Computations

  /**
   * @name customerID
   * @description Gets this.customer.id, if any
   * @memberof Project.prototype
   * @method customerID
   * @return {(Number|null)}
   * @mobx computed
   */
  @computed get customerID(){
    if (this.customer) return this.customer.id
    else return null
  }
  /**
   * @name status
   * @description Calculates Project's current status
   * @memberof Project.prototype
   * @method status
   * @return {String}
   * @mobx computed
   */
  @computed get status(){
    return 'Status string'
  }
  /**
   * @name timeSpent
   * @description Calculates Project's time total based on dates and reworks
   * @memberof Project.prototype
   * @method timeSpent
   * @return {String}
   * @mobx computed
   */
  @computed get timeSpent(){
    return 'Time spent string'
  }

  // Actions

  /**
   * @name changeCustomer
   * @description Sets this.customer, makes request to API to modify Project's related Customer
   * @memberof Project.prototype
   * @method changeCustomer
   * @param  {Customer}       customer new Customer to link to Project
   * @return {Promise}
   * @mobx action
   */
  @action async changeCustomer(customer){
    console.log(`Change Project Customer to: ${customer}`)
  }
  /**
   * @name delete
   * @description Makes request to API to remove Project from database
   * @memberof Project.prototype
   * @method delete
   * @return {Promise}
   * @mobx action
   */
   @action async delete(){
     console.log(`Delete project from API with ID: ${this.id}`)
   }
  /**
   * @name edit
   * @description Makes request to API to update Project attributes in database
   * @memberof Project.prototype
   * @method edit
   * @return {Promise}
   * @mobx action
   */
   @action async edit(){
     console.log(`Edit project in API with ID: ${this.id}`)
   }
  /**
   * @name changeHold
   * @description Makes request to API to change hold status in database; sets this.hold
   * @memberof Project.prototype
   * @method changeHold
   * @param  {Boolean}   flag        Indicator for hold to add (true) or remove (false)
   * @param  {String}   [descr]      Hold description
   * @param  {String}   [employeeID] Database ID of Employee adding hold
   * @return {Promise}
   * @mobx action
   */
   @action async changeHold(flag, descr, employeeID){
     console.log(`Change hold on project in API with flag: ${flag}${(flag) ? `, descr: ${descr}, employee ID: ${employeeID}` : ''}`)
   }
  /**
   * @name addRework
   * @description Makes request to API to add rework in database; updates this.reworks
   * @memberof Project.prototype
   * @method addRework
   * @param  {String}  descr      Rework description
   * @param  {String}  employeeID Database ID of Employee adding rework
   * @return {Promise}
   * @mobx action
   */
   @action async addRework(descr, employeeID){
     console.log(`Add rework on project in API with descr: ${descr}, employee ID: ${employeeID}`)
   }
  /**
   * @name finish
   * @description Makes request to API to mark project as finished; updates this.dateFinished
   * @memberof Project.prototype
   * @method finish
   * @return {Promise}
   * @mobx action
   */
   @action async finish(){
     console.log(`Finish project in API with ID: ${this.id}`)
   }
  /**
   * @name getDefaultTaskList
   * @description Makes request to API to get default task list for project type; updates this.tasks
   * @memberof Project.prototype
   * @method getDefaultTaskList
   * @return {Promise}
   * @mobx action
   */
   @action async getDefaultTaskList(){
     console.log(`Fetch project's default task list from API with job type: ${this.jobType}`)
   }
  /**
   * @name toggleTask
   * @description Call's Task's toggle
   * @memberof Project.prototype
   * @method toggleTask
   * @param  {Task}   task Task to toggle required status of
   * @return {Promise}
   * @mobx action
   */
   @action async toggleTask(task){
     console.log('Call\'s Task\'s toggle method')
   }
   /**
    * @name moveTask
    * @description Calls API to update task list in database; sets this.tasks
    * @memberof Project.prototype
    * @method moveTask
    * @param  {Task}  task     Task to move
    * @param  {Number}  newIndex New index in list for Task
    * @return {Promise}
    * @mobx action
    */
    @action async moveTask(task, newIndex){
      console.log(`Changes task position in project in API with new index: ${newIndex}`)
    }
   /**
    * @name addTask
    * @description Calls API to update task list in database; sets this.tasks
    * @memberof Project.prototype
    * @method addTask
    * @param  {String}  title         New task title
    * @param  {String}  [processArea] New task associated process area, if any
    * @return {Promise}
    * @mobx action
    */
    @action async addTask(title, processArea){
      console.log(`Adds task to project in API with title: ${title}${(processArea) ? `and process area: ${processArea}` : ''}`)
    }
   /**
    * @name removeTask
    * @description Calls API to update task list in database; sets this.tasks
    * @memberof Project.prototype
    * @method removeTask
    * @param  {Task}   task Task to remove
    * @return {Promise}
    * @mobx action
    */
    @action async removeTask(task){
      console.log('Removes task in project in API')
    }
   /**
    * @name addTimeEntry
    * @description Calls API to add time entry to project; updates this.timeEntries
    * @memberof Project.prototype
    * @method addTimeEntry
    * @param  {String}     employeeID database ID of employee adding time entry
    * @return {Promise}
    * @mobx action
    */
    @action async addTimeEntry(employeeID){
      console.log(`Adds time entry to project in API for employee: ${employeeID}`)
    }
}

const project = new Project()
export default project
