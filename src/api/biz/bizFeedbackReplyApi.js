import { baseRequest } from '@/utils/request'

const request = (url, ...arg) => baseRequest(`/biz/feedbackreply/` + url, ...arg)

/**
 * 反馈回复Api接口管理器
 *
 * @author jetox
 * @date  2025/10/19 00:15
 **/
export default {
	// 获取反馈回复分页
	bizFeedbackReplyPage(data) {
		return request('page', data, 'get')
	},
	// 提交反馈回复表单 edit为true时为编辑，默认为新增
	bizFeedbackReplySubmitForm(data, edit = false) {
		return request(edit ? 'edit' : 'add', data)
	},
	// 删除反馈回复
	bizFeedbackReplyDelete(data) {
		return request('delete', data)
	},
	// 获取反馈回复详情
	bizFeedbackReplyDetail(data) {
		return request('detail', data, 'get')
	},
	// 下载反馈回复导入模板
    bizFeedbackReplyDownloadTemplate(data) {
        return request('downloadImportTemplate', data, 'get', {
            responseType: 'blob'
        })
    },
    // 导入反馈回复
    bizFeedbackReplyImport(data) {
        return request('importData', data)
    },
    // 导出反馈回复
    bizFeedbackReplyExport(data) {
        return request('exportData', data, 'post', {
            responseType: 'blob'
        })
    }
}
