import request from '@/utils/request'

// 招聘管理列表
export function apiJobPositionsLists(params: any) {
    return request.get({ url: '/job_positions/lists', params })
}

// 添加招聘管理
export function apiJobPositionsAdd(params: any) {
    return request.post({ url: '/job_positions/add', params })
}

// 编辑招聘管理
export function apiJobPositionsEdit(params: any) {
    return request.post({ url: '/job_positions/edit', params })
}

// 删除招聘管理
export function apiJobPositionsDelete(params: any) {
    return request.post({ url: '/job_positions/delete', params })
}

// 招聘管理详情
export function apiJobPositionsDetail(params: any) {
    return request.get({ url: '/job_positions/detail', params })
}