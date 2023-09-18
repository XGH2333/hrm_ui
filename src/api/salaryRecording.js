import request from '../utils/request'

const url = '/salary/recording'


export const confirmSalaryRecording = (id) => {
  console.log(id)
  return request({
    url: url + "/confirm/" + id, method: 'get'
  })
}

export const getList = (params) => {
  return request({
    url: url, method: 'get', params
  })
}
