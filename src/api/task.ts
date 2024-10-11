import request from '@/utils/request'

// 任务管理列表
export function apiTaskLists(params: any) {
    return request.get({ url: '/task/lists', params })
}

// 添加任务管理
export function apiTaskAdd(params: any) {
    return request.post({ url: '/task/add', params })
}

// 编辑任务管理
export function apiTaskEdit(params: any) {
    return request.post({ url: '/task/edit', params })
}

// 删除任务管理
export function apiTaskDelete(params: any) {
    return request.post({ url: '/task/delete', params })
}

// 任务管理详情
export function apiTaskDetail(params: any) {
    return request.get({ url: '/task/detail', params })
}