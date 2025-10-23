import { baseRequest } from '@/utils/request'

const request = (url, ...arg) => baseRequest(`/biz/activity/` + url, ...arg)

/**
 * 志愿活动Api接口管理器
 *
 * @author jetox
 * @date  2025/10/19 00:08
 **/
export default {
	// 获取志愿活动分页
	volActivityPage(data) {
		return request('page', data, 'get')
	},
	// 提交志愿活动表单 edit为true时为编辑，默认为新增
	volActivitySubmitForm(data, edit = false) {
		return request(edit ? 'edit' : 'add', data)
	},
	// 删除志愿活动
	volActivityDelete(data) {
		return request('delete', data)
	},
	// 获取志愿活动详情
	volActivityDetail(data) {
		return request('detail', data, 'get')
	},
	// 下载志愿活动导入模板
    volActivityDownloadTemplate(data) {
        return request('downloadImportTemplate', data, 'get', {
            responseType: 'blob'
        })
    },
    // 导入志愿活动
    volActivityImport(data) {
        return request('importData', data)
    },
    // 导出志愿活动
    volActivityExport(data) {
        return request('exportData', data, 'post', {
            responseType: 'blob'
        })
    }
    // 注：二维码生成功能已移至前端实现，以下接口不再使用
    // volActivityGenerateQrCode(data) {
    //     return request('generateQrCode', data, 'get')
    // },
    // volActivityDownloadQrCode(data) {
    //     return request('downloadQrCode', data, 'get', {
    //         responseType: 'blob'
    //     })
    // }
}
