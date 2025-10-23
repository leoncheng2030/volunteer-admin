import { baseRequest } from '@/utils/request'

const request = (url, ...arg) => baseRequest(`/biz/activitycheckin/` + url, ...arg)

/**
 * 活动签到表Api接口管理器
 *
 * @author jetox
 * @date  2025/10/22 06:17
 **/
export default {
	// 获取活动签到表分页
	volActivityCheckinPage(data) {
		return request('page', data, 'get')
	},
	// 提交活动签到表表单 edit为true时为编辑，默认为新增
	volActivityCheckinSubmitForm(data, edit = false) {
		return request(edit ? 'edit' : 'add', data)
	},
	// 删除活动签到表
	volActivityCheckinDelete(data) {
		return request('delete', data)
	},
	// 获取活动签到表详情
	volActivityCheckinDetail(data) {
		return request('detail', data, 'get')
	},
	// 下载活动签到表导入模板
    volActivityCheckinDownloadTemplate(data) {
        return request('downloadImportTemplate', data, 'get', {
            responseType: 'blob'
        })
    },
    // 导入活动签到表
    volActivityCheckinImport(data) {
        return request('importData', data)
    },
    // 导出活动签到表
    volActivityCheckinExport(data) {
        return request('exportData', data, 'post', {
            responseType: 'blob'
        })
    }
}
