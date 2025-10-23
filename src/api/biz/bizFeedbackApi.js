import { baseRequest } from '@/utils/request'

const request = (url, ...arg) => baseRequest(`/biz/feedback/` + url, ...arg)

/**
 * 用户反馈Api接口管理器
 *
 * @author jetox
 * @date  2025/10/19 00:13
 **/
export default {
	// 获取用户反馈分页
	bizFeedbackPage(data) {
		return request('page', data, 'get')
	},
	// 提交用户反馈表单 edit为true时为编辑，默认为新增
	bizFeedbackSubmitForm(data, edit = false) {
		return request(edit ? 'edit' : 'add', data)
	},
	// 删除用户反馈
	bizFeedbackDelete(data) {
		return request('delete', data)
	},
	// 获取用户反馈详情
	bizFeedbackDetail(data) {
		return request('detail', data, 'get')
	},
	// 下载用户反馈导入模板
    bizFeedbackDownloadTemplate(data) {
        return request('downloadImportTemplate', data, 'get', {
            responseType: 'blob'
        })
    },
    // 导入用户反馈
    bizFeedbackImport(data) {
        return request('importData', data)
    },
    // 导出用户反馈
    bizFeedbackExport(data) {
        return request('exportData', data, 'post', {
            responseType: 'blob'
        })
    }
}
