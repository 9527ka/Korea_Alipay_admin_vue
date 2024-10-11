import request from '@/utils/request'

// 管理员表列表
export function apiAdminLists(params: any) {
    return request.get({ url: '/admin/lists', params })
}

// 添加管理员表
export function apiAdminAdd(params: any) {
    return request.post({ url: '/admin/add', params })
}

// 编辑管理员表
export function apiAdminEdit(params: any) {
    return request.post({ url: '/admin/edit', params })
}

// 删除管理员表
export function apiAdminDelete(params: any) {
    return request.post({ url: '/admin/delete', params })
}

// 管理员表详情
export function apiAdminDetail(params: any) {
    return request.get({ url: '/admin/detail', params })
}