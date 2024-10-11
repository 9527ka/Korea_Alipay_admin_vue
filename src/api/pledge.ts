import request from '@/utils/request'

// 质押产品列表
export function apiPledgeLists(params: any) {
    return request.get({ url: '/pledge/lists', params })
}

// 添加质押产品
export function apiPledgeAdd(params: any) {
    return request.post({ url: '/pledge/add', params })
}

// 编辑质押产品
export function apiPledgeEdit(params: any) {
    return request.post({ url: '/pledge/edit', params })
}

// 删除质押产品
export function apiPledgeDelete(params: any) {
    return request.post({ url: '/pledge/delete', params })
}

// 质押产品详情
export function apiPledgeDetail(params: any) {
    return request.get({ url: '/pledge/detail', params })
}