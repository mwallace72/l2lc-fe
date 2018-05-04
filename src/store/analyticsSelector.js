import AnalyticsModel from '../models/analyticsModel'
import autoBind from 'auto-bind'
import API from '../api'
import Consts from '../consts'

/**
 * @name AnalyticsSelector
 * @class AnalyticsSelector
 * @description Autobinds functions
 */
class AnalyticsSelector {
  constructor(){
    autoBind(this)
  }
  /**
   * @name getAll
   * @description Returns a list of objects with all the analytic types
   * @method getAll
   * @memberof AnalyticsSelector.prototype
   */
  getAll(){
    let analytics = [
      this.employeeHoursInStation(),
      this.employeeHoursInCostCenter(),
      this.projectCountForCostCenterRatio(),
      this.partCountForAPCRatio(),
      this.projectCountForMonthsRatio()
    ]
    API.fetchTimeEntries()
    .then(res => {
      // Following has structure:
      // Keys are employee names, values are list of objects with costCenter, station, time
      let employeeEntries = {}
      // Following has structure:
      // Keys are project IDs, value is object with costCenter, jobType, partCount, date (time)
      let projects = {}
      // List of string station names
      let stations = []
      // List of string cost center names
      let costCenters = []
      // List of string cost center and job type names
      let costCenterJobTypes = []
      // List of string APC job type names
      let apcJobTypes = []
      // Fill structures
      res.forEach(timeEntry => {
        let dateTime = new Date(timeEntry.time)
        if (timeEntry.employeeName){
          // If employee has pre-started list, push
          let obj = {
            costCenter: timeEntry.costCenter,
            station: timeEntry.station,
            time: dateTime,
          }
          if (employeeEntries.hasOwnProperty(timeEntry.employeeName)){
            employeeEntries[timeEntry.employeeName].push(obj)
          }
          // Else start list for employee
          else{
            employeeEntries[timeEntry.employeeName] = [obj]
          }
        }
        // Use first occurrence for projects
        if (!projects.hasOwnProperty(timeEntry.projectId)){
          projects[timeEntry.projectId] = {
            costCenter: timeEntry.costCenter,
            jobType: timeEntry.jobType,
            partCount: timeEntry.partCount,
            date: dateTime
          }
        }
        if (!stations.includes(timeEntry.station))
          stations.push(timeEntry.station)
        if (!costCenters.includes(timeEntry.costCenter))
          costCenters.push(timeEntry.costCenter)
        let cCJT = `${timeEntry.costCenter} - ${timeEntry.jobType}`
        if (!costCenterJobTypes.includes(cCJT))
          costCenterJobTypes.push(cCJT)
        if (timeEntry.costCenter == 'APC' && !apcJobTypes.includes(timeEntry.jobType))
          apcJobTypes.push(timeEntry.jobType)
      })

      // Time spent, by employee, by station
      analytics[0].model.setData({
        labels: stations,
        datasets: this.mapTimeByCategory(employeeEntries, stations, 'station')
      })
      /*
      [
        {
          label: 'Employee 1',
          backgroundColor: 'rgba(150,186,232,0.6)',
          borderColor: 'rgba(150,186,232,1)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(150,186,232,0.4)',
          data: [4,6,8,9,5]
        },
        {
          label: 'Employee 2',
          backgroundColor: 'rgba(161,160,160,0.6)',
          borderColor: 'rgba(161,160,160,1)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(161,160,160,0.4)',
          data: [5,5,8,1,6]
        },
        {
          label: 'Employee 3',
          backgroundColor: 'rgba(150,232,186,0.6)',
          borderColor: 'rgba(150,232,186,1)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(150,232,186,0.4)',
          data: [1,0,0,3,1]
        }
      ]
       */

      // Time spent, by employee, by cost center
      analytics[1].model.setData({
        labels: costCenters,
        datasets: this.mapTimeByCategory(employeeEntries, costCenters, 'costCenter')
      })

      // TODO: Projects, by cost center and job type (if cost center and job type match and only one job type for cost center, abbreviate)
      analytics[2].model.setData({
        labels: costCenterJobTypes,
        datasets: [
          {
            data: [50,20,15,10,5,10,10],
            backgroundColor: Consts.pieColors,
            hoverBackgroundColor: Consts.pieColors
          }
        ]
      })
      // TODO: APC project parts, by job type
      analytics[3].model.setData({
        labels: apcJobTypes,
        datasets: [
          {
            data: [500,200,150,100,50,100],
            backgroundColor: Consts.pieColors,
            hoverBackgroundColor: Consts.pieColors
          }
        ]
      })
      // Projects, by month
      let months = {}
      Object.keys(projects).forEach(key => {
        let month = projects[key].date.toLocaleString('en-us', {month: 'long'})
        if (!months.hasOwnProperty(month))
          months[month] = 1
        else {
          months[month] = months[month]+1
        }
      })
      let data = []
      let monthStr = []
      Object.keys(months).forEach(key => {
        data.push(months[key])
        monthStr.push(key)
      })
      // [50,20,15,10,5,10,10,20,10,10,10,10]
      analytics[4].model.setData({
        labels: monthStr,
        datasets: [
          {
            data,
            backgroundColor: Consts.pieColors,
            hoverBackgroundColor: Consts.pieColors
          }
        ]
      })
    })
    return analytics
  }

  /**
   * @name categoryStructure
   * @description Maps category names to empty arrays in an object
   * @method categoryStructure
   * @param  {String[]}          categories Category names
   * @return {Object}
   * @memberof AnalyticsSelector.prototype
   */
  categoryStructure(categories){
    let data = {}
    // Map category names
    categories.forEach(category => {
      data[category] = []
    })
    return data
  }

  /**
   * @name mapTimeByCategory
   * @description Maps time entries by a category in a set of categories
   * @method mapTimeByCategory
   * @param  {Object[]}          employeeEntries Time entries
   * @param  {String[]}          categories      List of categories
   * @param  {String}          categoryName      Property accessor name corresponding to one of categories
   * @return {Object[]}
   * @memberof AnalyticsSelector.prototype
   */
  mapTimeByCategory(employeeEntries, categories, categoryName){
    let datasets = []
    Object.keys(employeeEntries).forEach((key,index) => {
      let data = []
      let entriesByCategory = this.categoryStructure(categories)
      // Map entries to costCenters
      employeeEntries[key].forEach(entry => {
        entriesByCategory[entry[categoryName]].push(entry)
      })
      // Process entries per station
      // Remove stations with <2 entries
      Object.keys(entriesByCategory).forEach(key => {
        if (entriesByCategory[key].length < 2)
          delete entriesByCategory[key]
        else{
          // Uneven number
          if (entriesByCategory[key].length % 2 != 0)
            entriesByCategory[key].pop()
          // Calculate time totals here
          let {hour, min} = Consts.calculateTime(entriesByCategory[key].map(item => item.time))
          data.push(hour+parseFloat((min / 60.0).toFixed(2)))
        }
      })
      datasets.push({
        label: key,
        backgroundColor: Consts.barBGColorByIndex(index),
        borderColor: Consts.barBorColorByIndex(index),
        borderWidth: 1,
        hoverBackgroundColor: Consts.barHovColorByIndex(index),
        data
      })
    })
    return datasets
  }

  /**
   * @name employeeHoursInStation
   * @description Returns the defined object specific to this analytic
   * @method employeeHoursInStation
   * @memberof AnalyticsSelector.prototype
   */
  employeeHoursInStation() {
    return {
      title: 'Employee Hours in a Station',
      model: new AnalyticsModel(
        [
          {
            type: 'Split Bar',
            component: 'bar',
            data: null
          },
          {
            type: 'Grouped Bar',
            component: 'bar',
            data: (datasets) => {
              let newdataset = [{
                backgroundColor: Consts.barBGColorByIndex(0),
                borderColor: Consts.barBorColorByIndex(0),
                borderWidth: 1,
                hoverBackgroundColor: Consts.barHovColorByIndex(0),
                label: 'Hours',
                data: []
              }]
              datasets.forEach(item => {
                if (newdataset[0].data.length == 0)
                  newdataset[0].data = item.data.slice()
                else
                  item.data.forEach((datapt,index) => {
                    newdataset[0].data[index]+=datapt
                  })
              })
              return newdataset
            }
          },
          {
            type: 'Pie',
            component: 'pie',
            data: (datasets) => {
              let newdataset = [{
                backgroundColor: Consts.pieColors,
                hoverBackgroundColor: Consts.pieColors,
                data: []
              }]
              datasets.forEach(item => {
                if (newdataset[0].data.length == 0)
                  newdataset[0].data = item.data.slice()
                else
                  item.data.forEach((datapt,index) => {
                    newdataset[0].data[index]+=datapt
                  })
              })
              return newdataset
            }
          }
        ]
      )
    }
  }
  /**
   * @name employeeHoursInCostCenter
   * @description Returns the defined object specific to this analytic
   * @method employeeHoursInCostCenter
   * @memberof AnalyticsSelector.prototype
   */
  employeeHoursInCostCenter() {
    return {
      title: 'Employee Hours in a Cost Center',
      model: new AnalyticsModel(
        [
          {
            type: 'Split Bar',
            component: 'bar',
            data: null
          },
          {
            type: 'Pie',
            component: 'pie',
            data: (datasets) => {
              let newdataset = [{
                backgroundColor: Consts.pieColors,
                hoverBackgroundColor: Consts.pieColors,
                data: []
              }]
              datasets.forEach(item => {
                if (newdataset[0].data.length == 0)
                  newdataset[0].data = item.data.slice()
                else
                  item.data.forEach((datapt,index) => {
                    newdataset[0].data[index]+=datapt
                  })
              })
              return newdataset
            }
          }
        ]
      )
    }
  }
  /**
   * @name projectCountForCostCenterRatio
   * @description Returns the defined object specific to this analytic
   * @method projectCountForCostCenterRatio
   * @memberof AnalyticsSelector.prototype
   */
  projectCountForCostCenterRatio() {
    return {
      title: 'Total Project Count for a Cost Center Ratio',
      model: new AnalyticsModel(
        null,
        'pie'
      )
    }
  }
  /**
   * @name projectCountForAPCRatio
   * @description Returns the defined object specific to this analytic
   * @method projectCountForAPCRatio
   * @memberof AnalyticsSelector.prototype
   */
  // projectCountForAPCRatio() {
  //   return {
  //     title: 'Total Project Type Count for APC Projects',
  //     model: new AnalyticsModel(
  //       null,
  //       'pie'
  //     )
  //   }
  // }
  /**
   * @name partCountForAPCRatio
   * @description Returns the defined object specific to this analytic
   * @method partCountForAPCRatio
   * @memberof AnalyticsSelector.prototype
   */
  partCountForAPCRatio() {
    return {
      title: 'Total Part Count for APC Projects',
      model: new AnalyticsModel(
        null,
        'pie'
      )
    }
  }
  /**
   * @name projectCountForMonthsRatio
   * @description Returns the defined object specific to this analytic
   * @method projectCountForMonthsRatio
   * @memberof AnalyticsSelector.prototype
   */
  projectCountForMonthsRatio() {
    return {
      title: 'Monthly Total Project Count',
      model: new AnalyticsModel(
        null,
        'pie'
      )
    }
  }
}

const analyticsSelector = new AnalyticsSelector()
export default analyticsSelector
