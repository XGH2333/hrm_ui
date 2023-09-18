import request from '../utils/request'

const url = '/salary/recording'


export const createSalaryRecording = (id) => {
  return request({
    url: url + "/create/" + id, method: 'get'
  })
}
export const confirmSalaryRecording = (id) => {
  return request({
    url: url + "/confirm/" + id, method: 'get'
  })
}

export const getList = (params) => {
  return request({
    url: url, method: 'get', params
  })
}
