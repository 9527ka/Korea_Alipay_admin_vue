import request from '@/utils/request'

// 常量文章列表
export function apiConfigArticleLists(params: any) {
    return request.get({ url: '/config_article/lists', params })
}

// 添加常量文章
export function apiConfigArticleAdd(params: any) {
    return request.post({ url: '/config_article/add', params })
}

// 编辑常量文章
export function apiConfigArticleEdit(params: any) {
    return request.post({ url: '/config_article/edit', params })
}

// 删除常量文章
export function apiConfigArticleDelete(params: any) {
    return request.post({ url: '/config_article/delete', params })
}

// 常量文章详情
export function apiConfigArticleDetail(params: any) {
    return request.get({ url: '/config_article/detail', params })
}