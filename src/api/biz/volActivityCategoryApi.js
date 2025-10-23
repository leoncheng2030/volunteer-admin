import { baseRequest } from '@/utils/request'

const request = (url, ...arg) => baseRequest(`/biz/activitycategory/` + url, ...arg)

/**
 * 活动分类Api接口管理器
 *
 * @author jetox
 * @date  2025/10/19 00:04
 **/
export default {
	// 获取活动分类分页
	volActivityCategoryPage(data) {
		return request('page', data, 'get')
	},
	// 提交活动分类表单 edit为true时为编辑，默认为新增
	volActivityCategorySubmitForm(data, edit = false) {
		return request(edit ? 'edit' : 'add', data)
	},
	// 删除活动分类
	volActivityCategoryDelete(data) {
		return request('delete', data)
	},
	// 获取活动分类详情
	volActivityCategoryDetail(data) {
		return request('detail', data, 'get')
	},
	// 下载活动分类导入模板
    volActivityCategoryDownloadTemplate(data) {
        return request('downloadImportTemplate', data, 'get', {
            responseType: 'blob'
        })
    },
    // 导入活动分类
    volActivityCategoryImport(data) {
        return request('importData', data)
    },
    // 导出活动分类
    volActivityCategoryExport(data) {
        return request('exportData', data, 'post', {
            responseType: 'blob'
        })
    }
}
