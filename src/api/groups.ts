import request from '@/utils/request'

// 红包群表列表
export function apiGroupsLists(params: any) {
    return request.get({ url: '/groups/lists', params })
}

// 添加红包群表
export function apiGroupsAdd(params: any) {
    return request.post({ url: '/groups/add', params })
}

// 编辑红包群表
export function apiGroupsEdit(params: any) {
    return request.post({ url: '/groups/edit', params })
}

// 删除红包群表
export function apiGroupsDelete(params: any) {
    return request.post({ url: '/groups/delete', params })
}

// 红包群表详情
export function apiGroupsDetail(params: any) {
    return request.get({ url: '/groups/detail', params })
}