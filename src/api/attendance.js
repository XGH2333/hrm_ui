import request from '../utils/request'

const url = '/attendance'

/**
 * 添加
 * @param data
 * @returns {AxiosPromise}
 */
export const add = (data) => {
  return request({
    url: url, method: 'post', data
  })
}

/**
 * 逻辑删除
 * @param id
 * @returns {AxiosPromise}
 */
export const deleteOne = (id) => {
  return request({
    url: url + '/' + id, method: 'delete'
  })
}

export const deleteBatch = (ids) => {
  return request({
    url: url + '/batch/' + ids, method: 'delete'
  })
}

export const edit = (data) => {
  return request({
    url: url, method: 'put', data
  })
}

// 分页条件查询
export const getList = (params) => {
  return request({
    url: url, method: 'get', params
  })
}

// 查询所有
export const getAll = () => {
  return request({
    url: url + '/all'
  })
}

// 得到一条数据
export const getOne = (id) => {
  return request({
    url: url + '/' + id
  })
}

export const getByStaffIdAndDate = (id, date) => {
  return request({
    url: url + '/staff/' + id + '/' + date
  })
}

// 设置社保
export const setAttendance = (data) => {
  return request({
    url: url + '/set', method: 'put', data
  })
}

// 得到一条数据
// 数据导入
export const getImportApi = () => {
  return 'http://xghwy.xghwy.top:' + process.env.VUE_APP_PORT + url + '/import'
}

// 数据导出
export const getExportApi = (month) => {
  return 'http://xghwy.xghwy.top:' + process.env.VUE_APP_PORT + url + '/export/' + month
}

// python端接口地址
export const getOpenCVApi = () => {
  return 'ws://xghwy.xghwy.top:8080/dev/opencv/client'
}
