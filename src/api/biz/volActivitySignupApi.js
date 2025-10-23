import { baseRequest } from '@/utils/request'

const request = (url, ...arg) => baseRequest(`/biz/activitysignup/` + url, ...arg)

/**
 * 报名记录Api接口管理器
 *
 * @author jetox
 * @date  2025/10/19 00:11
 **/
export default {
	// 获取报名记录分页
	volActivitySignupPage(data) {
		return request('page', data, 'get')
	},
	// 提交报名记录表单 edit为true时为编辑，默认为新增
	volActivitySignupSubmitForm(data, edit = false) {
		return request(edit ? 'edit' : 'add', data)
	},
	// 删除报名记录
	volActivitySignupDelete(data) {
		return request('delete', data)
	},
	// 获取报名记录详情
	volActivitySignupDetail(data) {
		return request('detail', data, 'get')
	},
	// 下载报名记录导入模板
    volActivitySignupDownloadTemplate(data) {
        return request('downloadImportTemplate', data, 'get', {
            responseType: 'blob'
        })
    },
    // 导入报名记录
    volActivitySignupImport(data) {
        return request('importData', data)
    },
    // 导出报名记录
    volActivitySignupExport(data) {
        return request('exportData', data, 'post', {
            responseType: 'blob'
        })
    }
}
