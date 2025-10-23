<template>
	<a-card :bordered="false" style="width: 100%">
		<a-form ref="searchFormRef" :model="searchFormState">
			<a-row :gutter="10">
				<a-col :xs="24" :sm="6" :md="6" :lg="6" :xl="6">
					<a-form-item label="活动标题" name="title">
						<a-input v-model:value="searchFormState.title" placeholder="请输入活动标题" />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="6" :md="6" :lg="6" :xl="6">
					<a-form-item label="活动地点" name="location">
						<a-input v-model:value="searchFormState.location" placeholder="请输入活动地点" />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="6" :md="6" :lg="6" :xl="6">
					<a-form-item label="联系人" name="contactPerson">
						<a-input v-model:value="searchFormState.contactPerson" placeholder="请输入联系人" />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="6" :md="6" :lg="6" :xl="6" v-show="advanced">
					<a-form-item label="联系电话" name="contactPhone">
						<a-input v-model:value="searchFormState.contactPhone" placeholder="请输入联系电话" />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="6" :md="6" :lg="6" :xl="6" v-show="advanced">
					<a-form-item label="活动状态" name="status">
						<a-select v-model:value="searchFormState.status" placeholder="请选择活动状态" :options="statusOptions" />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="6" :md="6" :lg="6" :xl="6">
				    <a-form-item>
				        <a-space>
				            <a-button type="primary" @click="tableRef.refresh(true)">
				                <template #icon><SearchOutlined /></template>
				                查询
				            </a-button>
				            <a-button @click="reset">
				                <template #icon><redo-outlined /></template>
				                 重置
				            </a-button>
                            <a @click="toggleAdvanced">
                                {{ advanced ? '收起' : '展开' }}
                                <component :is="advanced ? 'up-outlined' : 'down-outlined'"/>
                            </a>
                        </a-space>
                    </a-form-item>
                </a-col>
            </a-row>
		</a-form>
		<s-table
			ref="tableRef"
			:columns="columns"
			:data="loadData"
			:alert="options.alert.show"
			bordered
			:row-key="(record) => record.id"
			:tool-config="toolConfig"
			:row-selection="options.rowSelection"
			:scroll="{ x: 'max-content' }"
		>
			<template #operator class="table-operator">
				<a-space>
					<a-button type="primary" @click="formRef.onOpen()" v-if="hasPerm('volActivityAdd')">
						<template #icon><plus-outlined /></template>
						新增
					</a-button>
					<a-button @click="importModelRef.onOpen()" v-if="hasPerm('volActivityImport')">
                        <template #icon><import-outlined /></template>
                        <span>导入</span>
                    </a-button>
                    <a-button @click="exportData" v-if="hasPerm('volActivityExport')">
                        <template #icon><export-outlined /></template>
                        <span>导出</span>
                    </a-button>
					<xn-batch-button
						v-if="hasPerm('volActivityBatchDelete')"
						buttonName="批量删除"
						icon="DeleteOutlined"
						buttonDanger
						:selectedRowKeys="selectedRowKeys"
						@batchCallBack="deleteBatchVolActivity"
					/>
				</a-space>
			</template>
			<template #bodyCell="{ column, record }">
				<template v-if="column.dataIndex === 'coverImage'">
					<a-image :src="record.coverImage" style="width: 30px; height: 30px;" />
				</template>
				<template v-if="column.dataIndex === 'status'">
					{{ $TOOL.dictTypeData('VOL_ACTIVITY_STATUS', record.status) }}
				</template>
				<template v-if="column.dataIndex === 'allowResignup'">
					<a-tag :color="record.allowResignup ? 'green' : 'red'">
						{{ record.allowResignup ? '是' : '否' }}
					</a-tag>
				</template>
				<template v-if="column.dataIndex === 'action'">
					<a-space>
						<a @click="formRef.onOpen(record)" v-if="hasPerm('volActivityEdit')">编辑</a>
						<a-divider type="vertical" v-if="hasPerm(['volActivityEdit', 'volActivityGenerateQrCode'], 'or')" />
						<a @click="showQrCode(record)" v-if="hasPerm('volActivityGenerateQrCode')">查看二维码</a>
						<a-divider type="vertical" v-if="hasPerm(['volActivityGenerateQrCode', 'volActivityDelete'], 'and')" />
						<a-popconfirm title="确定要删除吗？" @confirm="deleteVolActivity(record)">
							<a-button type="link" danger size="small" v-if="hasPerm('volActivityDelete')">删除</a-button>
						</a-popconfirm>
					</a-space>
				</template>
			</template>
		</s-table>
	</a-card>
	<ImportModel ref="importModelRef" />
	<Form ref="formRef" @successful="tableRef.refresh()" />
	<!-- 二维码查看弹窗 -->
	<a-modal
		v-model:visible="qrCodeVisible"
		title="活动签到二维码"
		:footer="null"
		width="450px"
		centered
	>
		<div class="qrcode-container">
			<div class="activity-info">
				<h3>{{ currentActivity.title }}</h3>
				<p><a-tag color="blue">活动时间</a-tag> {{ currentActivity.activityDate }} {{ currentActivity.startTime }}</p>
				<p><a-tag color="green">活动地点</a-tag> {{ currentActivity.location }}</p>
			</div>
			<div class="qrcode-image">
				<a-spin :spinning="qrLoading">
					<img v-if="qrCodeUrl" :src="qrCodeUrl" alt="签到二维码" style="width: 300px; height: 300px; display: block; margin: 20px auto;" />
				</a-spin>
			</div>
			<div class="qrcode-tip" style="margin: 16px 0;">
				<a-alert message="请监护人使用小程序扫描此二维码进行签到" type="info" show-icon />
			</div>
			<div class="qrcode-actions" style="text-align: center;">
				<a-button type="primary" @click="downloadQrCodeImage(currentActivity)">
					<template #icon><download-outlined /></template>
					下载二维码
				</a-button>
			</div>
		</div>
	</a-modal>
</template>

<script setup name="activity">
	import tool from '@/utils/tool'
	import { cloneDeep } from 'lodash-es'
	import Form from './form.vue'
	import ImportModel from './importModel.vue'
	import downloadUtil from '@/utils/downloadUtil'
	import volActivityApi from '@/api/biz/volActivityApi'
	import QRCode from 'qrcode'
	const searchFormState = ref({})
	const searchFormRef = ref()
	const tableRef = ref()
	const importModelRef = ref()
	const formRef = ref()
	const toolConfig = { refresh: true, height: true, columnSetting: true, striped: false }
	// 查询区域显示更多控制
	const advanced = ref(false)
	const toggleAdvanced = () => {
		advanced.value = !advanced.value
	}
	const columns = [
		{
			title: '图片',
			dataIndex: 'coverImage',
			width: 80,
			align:'center'
		},
		{
			title: '活动标题',
			dataIndex: 'title'
		},
		{
			title: '活动日期',
			dataIndex: 'activityDate',
			width: 120,
			align:'center'
		},
		{
			title: '开始时间',
			dataIndex: 'startTime',
			width: 80,
			align:'center'
		},
		{
			title: '结束时间',
			dataIndex: 'endTime',
			width: 80,
			align:'center'
		},
		{
			title: '活动地点',
			dataIndex: 'location'
		},
		{
			title: '招募人数',
			dataIndex: 'recruitCount',
			width: 80,
			align:'center'
		},
		{
			title: '报名人数',
			dataIndex: 'signedCount',
			width: 80,
			align:'center'
		},
		{
			title: '服务时长',
			dataIndex: 'serviceHours',
			width: 80,
			align:'center'
		},
		{
			title: '活动积分',
			dataIndex: 'activityPoints',
			width: 80,
			align:'center'
		},
		{
			title: '报名截止时间',
			dataIndex: 'signupDeadline'
		},
		{
			title: '联系人',
			dataIndex: 'contactPerson',
			width: 100
		},
		{
			title: '联系电话',
			dataIndex: 'contactPhone',
			width: 100,
			align:'center'
		},
		{
			title: '活动状态',
			dataIndex: 'status',
			width: 80,
			align:'center'
		},
		{
			title: '再次报名',
			dataIndex: 'allowResignup',
			width: 80,
			align:'center'
		},
		{
			title: '排序码',
			dataIndex: 'sortCode',
			width: 80,
			align:'center'
		},
		{
			title: '备注',
			dataIndex: 'remark'
		}
	]
	// 操作栏通过权限判断是否显示
	if (hasPerm(['volActivityEdit', 'volActivityDelete'])) {
		columns.push({
			title: '操作',
			dataIndex: 'action',
			align: 'center',
			fixed: 'right'
		})
	}
	const selectedRowKeys = ref([])
	// 列表选择配置
	const options = {
		alert: {
			show: true,
			clear: () => {
				selectedRowKeys.value = ref([])
			}
		},
		rowSelection: {
			onChange: (selectedRowKey, selectedRows) => {
				selectedRowKeys.value = selectedRowKey
			}
		}
	}
	const loadData = (parameter) => {
		const searchFormParam = cloneDeep(searchFormState.value)
		return volActivityApi.volActivityPage(Object.assign(parameter, searchFormParam)).then((data) => {
			// 解析每个活动的配置信息
			if (data && data.records) {
				data.records.forEach(record => {
					try {
						// 解析allowResignup配置
						if (record.extJson) {
							const extInfo = JSON.parse(record.extJson)
							record.allowResignup = extInfo.allowResignup || false
							record.activityPoints = extInfo.activityPoints || 0
						} else {
							record.allowResignup = false
							record.activityPoints = 0
						}
						
						// 格式化时间显示
						if (record.activityDate) {
							// 只显示日期部分
							record.activityDate = record.activityDate.split(' ')[0]
						}
						if (record.startTime) {
							// 只显示时间部分，格式化为HH:mm
							const timePart = record.startTime.split(' ')[1] || record.startTime
							record.startTime = timePart.substring(0, 5)
						}
						if (record.endTime) {
							// 只显示时间部分，格式化为HH:mm
							const timePart = record.endTime.split(' ')[1] || record.endTime
							record.endTime = timePart.substring(0, 5)
						}
						
					} catch (e) {
						record.allowResignup = false
					}
				})
			}
			return data
		})
	}
	// 重置
	const reset = () => {
		searchFormRef.value.resetFields()
		tableRef.value.refresh(true)
	}
	// 删除
	const deleteVolActivity = (record) => {
		let params = [
			{
				id: record.id
			}
		]
		volActivityApi.volActivityDelete(params).then(() => {
			tableRef.value.refresh(true)
		})
	}
	// 导出
    const exportData = () => {
        if (selectedRowKeys.value.length > 0) {
            const params = selectedRowKeys.value.map((m) => {
                return {
                    id: m
                }
            })
            volActivityApi.volActivityExport(params).then((res) => {
                downloadUtil.resultDownload(res)
            })
        } else {
            volActivityApi.volActivityExport([]).then((res) => {
                downloadUtil.resultDownload(res)
            })
        }
    }
	// 批量删除
	const deleteBatchVolActivity = (params) => {
		volActivityApi.volActivityDelete(params).then(() => {
			tableRef.value.clearRefreshSelected()
		})
	}
	const statusOptions = tool.dictList('VOL_ACTIVITY_STATUS')
	
	// 二维码相关功能
	const qrCodeVisible = ref(false)
	const qrCodeUrl = ref('')
	const qrLoading = ref(false)
	const currentActivity = ref({})
	
	// 查看二维码（前端生成）
	const showQrCode = async (record) => {
		currentActivity.value = record
		qrCodeVisible.value = true
		qrLoading.value = true
		
		try {
			// 构建小程序页面路径（微信扫一扫会自动识别小程序码）
			// 注意：这里生成的是小程序路径，微信扫码会自动打开小程序
			const miniProgramPath = `/pages/activity/checkin?activityId=${record.id}`
			
			// 也可以生成H5链接作为备用方案
			// const h5Url = `https://你的域名/h5/#/pages/activity/checkin?activityId=${record.id}`
			
			// 前端生成二维码（包含完整路径）
			const dataUrl = await QRCode.toDataURL(miniProgramPath, {
				width: 300,
				margin: 2,
				color: {
					dark: '#000000',
					light: '#FFFFFF'
				}
			})
			
			qrCodeUrl.value = dataUrl
		} catch (error) {
			console.error('生成二维码失败:', error)
			this.$message.error('生成二维码失败')
		} finally {
			qrLoading.value = false
		}
	}
	
	// 下载二维码（前端生成并下载）
	const downloadQrCodeImage = async (record) => {
		try {
			// 构建小程序页面路径
			const miniProgramPath = `/pages/activity/checkin?activityId=${record.id}`
			
			// 前端生成二维码
			const dataUrl = await QRCode.toDataURL(miniProgramPath, {
				width: 300,
				margin: 2,
				color: {
					dark: '#000000',
					light: '#FFFFFF'
				}
			})
			
			// 将 DataURL 转换为 Blob 并下载
			const blob = await (await fetch(dataUrl)).blob()
			const url = window.URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.download = `活动签到二维码_${record.title}_${Date.now()}.png`
			link.click()
			window.URL.revokeObjectURL(url)
		} catch (error) {
			console.error('下载二维码失败:', error)
			this.$message.error('下载二维码失败')
		}
	}
</script>
