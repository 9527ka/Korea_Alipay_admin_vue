import request from '@/utils/request'

// 用户任务管理列表
export function apiUserTaskLists(params: any) {
    return request.get({ url: '/user_task/lists', params })
}

// 添加用户任务管理
export function apiUserTaskAdd(params: any) {
    return request.post({ url: '/user_task/add', params })
}

// 编辑用户任务管理
export function apiUserTaskEdit(params: any) {
    return request.post({ url: '/user_task/edit', params })
}

// 删除用户任务管理
export function apiUserTaskDelete(params: any) {
    return request.post({ url: '/user_task/delete', params })
}

// 用户任务管理详情
export function apiUserTaskDetail(params: any) {
    return request.get({ url: '/user_task/detail', params })
}