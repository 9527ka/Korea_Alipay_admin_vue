import request from '@/utils/request'

// Banner管理列表
export function apiBannerLists(params: any) {
    return request.get({ url: '/banner/lists', params })
}

// 添加Banner管理
export function apiBannerAdd(params: any) {
    return request.post({ url: '/banner/add', params })
}

// 编辑Banner管理
export function apiBannerEdit(params: any) {
    return request.post({ url: '/banner/edit', params })
}

// 删除Banner管理
export function apiBannerDelete(params: any) {
    return request.post({ url: '/banner/delete', params })
}

// Banner管理详情
export function apiBannerDetail(params: any) {
    return request.get({ url: '/banner/detail', params })
}