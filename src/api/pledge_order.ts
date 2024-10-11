import request from '@/utils/request'

// 质押订单管理列表
export function apiPledgeOrderLists(params: any) {
    return request.get({ url: '/pledge_order/lists', params })
}

// 添加质押订单管理
export function apiPledgeOrderAdd(params: any) {
    return request.post({ url: '/pledge_order/add', params })
}

// 编辑质押订单管理
export function apiPledgeOrderEdit(params: any) {
    return request.post({ url: '/pledge_order/edit', params })
}

// 删除质押订单管理
export function apiPledgeOrderDelete(params: any) {
    return request.post({ url: '/pledge_order/delete', params })
}

// 质押订单管理详情
export function apiPledgeOrderDetail(params: any) {
    return request.get({ url: '/pledge_order/detail', params })
}