import config from '@/config'
import request from '@/utils/request'

// 客服聊天消息列表
export function serviceList(params: any) {
    return request.post({ url: '/chat/serviceList', params})
}

// 退出登录
export function logout() {
    return request.post({ url: '/login/logout' })
}
