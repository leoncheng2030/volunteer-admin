<template>
	<a-card :bordered="false" style="width: 100%">
		<a-form ref="searchFormRef" :model="searchFormState">
			<a-row :gutter="10">
				<a-col :xs="24" :sm="6" :md="6" :lg="6" :xl="6">
					<a-form-item label="反馈标题" name="title">
						<a-input v-model:value="searchFormState.title" placeholder="请输入反馈标题" />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="6" :md="6" :lg="6" :xl="6">
					<a-form-item label="反馈内容" name="content">
						<a-input v-model:value="searchFormState.content" placeholder="请输入反馈内容" />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="6" :md="6" :lg="6" :xl="6">
					<a-form-item label="反馈类型" name="type">
						<a-input v-model:value="searchFormState.type" placeholder="请输入反馈类型" />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="6" :md="6" :lg="6" :xl="6" v-show="advanced">
					<a-form-item label="联系人姓名" name="contactName">
						<a-input v-model:value="searchFormState.contactName" placeholder="请输入联系人姓名" />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="6" :md="6" :lg="6" :xl="6" v-show="advanced">
					<a-form-item label="联系电话" name="contactPhone">
						<a-input v-model:value="searchFormState.contactPhone" placeholder="请输入联系电话" />
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
								<component :is="advanced ? 'up-outlined' : 'down-outlined'" />
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
					<a-button type="primary" @click="formRef.onOpen()" v-if="hasPerm('bizFeedbackAdd')">
						<template #icon><plus-outlined /></template>
						新增
					</a-button>
					<a-button @click="importModelRef.onOpen()" v-if="hasPerm('bizFeedbackImport')">
						<template #icon><import-outlined /></template>
						<span>导入</span>
					</a-button>
					<a-button @click="exportData" v-if="hasPerm('bizFeedbackExport')">
						<template #icon><export-outlined /></template>
						<span>导出</span>
					</a-button>
					<xn-batch-button
						v-if="hasPerm('bizFeedbackBatchDelete')"
						buttonName="批量删除"
						icon="DeleteOutlined"
						buttonDanger
						:selectedRowKeys="selectedRowKeys"
						@batchCallBack="deleteBatchBizFeedback"
					/>
				</a-space>
			</template>
			<template #bodyCell="{ column, record }">
				<template v-if="column.dataIndex === 'attachmentUrl'">
					<a-image-preview-group v-if="record.attachmentUrl">
						<a-image
							v-for="(url, index) in record.attachmentUrl.split(',')"
							:key="index"
							:src="url"
							:width="20"
							:height="20"
							style="object-fit: cover; border-radius: 4px; margin-right: 8px"
						/>
					</a-image-preview-group>
					<span v-else style="color: #999">-</span>
				</template>
				<template v-if="column.dataIndex === 'type'">
					<a-tag :color="getTypeColor(record.type)">{{ getTypeText(record.type) }}</a-tag>
				</template>
				<template v-if="column.dataIndex === 'status'">
					{{ $TOOL.dictTypeData('BIZ_FEEDBACK_STATUS', record.status) }}
				</template>
				<template v-if="column.dataIndex === 'priority'">
					{{ $TOOL.dictTypeData('BIZ_FEEDBACK_PRIORITY', record.priority) }}
				</template>
				<template v-if="column.dataIndex === 'userType'">
					{{ $TOOL.dictTypeData('BIZ_FEEDBACK_USER_TYPE', record.userType) }}
				</template>
				<template v-if="column.dataIndex === 'action'">
					<a-space>
						<a @click="replyModalRef.onOpen(record)" v-if="hasPerm('bizFeedbackReply')"> <message-outlined /> 回复 </a>
						<a-divider type="vertical" v-if="hasPerm(['bizFeedbackReply', 'bizFeedbackEdit'], 'and')" />
						<a @click="formRef.onOpen(record)" v-if="hasPerm('bizFeedbackEdit')">编辑</a>
						<a-divider type="vertical" v-if="hasPerm(['bizFeedbackEdit', 'bizFeedbackDelete'], 'and')" />
						<a-popconfirm title="确定要删除吗？" @confirm="deleteBizFeedback(record)">
							<a-button type="link" danger size="small" v-if="hasPerm('bizFeedbackDelete')">删除</a-button>
						</a-popconfirm>
					</a-space>
				</template>
			</template>
		</s-table>
	</a-card>
	<ImportModel ref="importModelRef" />
	<Form ref="formRef" @successful="tableRef.refresh()" />
	<ReplyModal ref="replyModalRef" @successful="tableRef.refresh()" />
</template>

<script setup name="feedback">
	import tool from '@/utils/tool'
	import { cloneDeep } from 'lodash-es'
	import Form from './form.vue'
	import ImportModel from './importModel.vue'
	import ReplyModal from './replyModal.vue'
	import downloadUtil from '@/utils/downloadUtil'
	import bizFeedbackApi from '@/api/biz/bizFeedbackApi'
	import { MessageOutlined } from '@ant-design/icons-vue'
	const searchFormState = ref({})
	const searchFormRef = ref()
	const tableRef = ref()
	const importModelRef = ref()
	const formRef = ref()
	const replyModalRef = ref()
	const toolConfig = { refresh: true, height: true, columnSetting: true, striped: false }
	// 查询区域显示更多控制
	const advanced = ref(false)
	const toggleAdvanced = () => {
		advanced.value = !advanced.value
	}
	const columns = [
		{
			title: '反馈标题',
			dataIndex: 'title'
		},
		{
			title: '反馈内容',
			dataIndex: 'content'
		},
		{
			title: '反馈类型',
			dataIndex: 'type'
		},
		{
			title: '联系电话',
			dataIndex: 'contactPhone'
		},
		{
			title: '附件',
			dataIndex: 'attachmentUrl',
			width: 80,
			align: 'center'
		},
		{
			title: '处理状态',
			dataIndex: 'status'
		},
		{
			title: '优先级',
			dataIndex: 'priority'
		},
		{
			title: '反馈用户ID',
			dataIndex: 'userId'
		},
		{
			title: '用户类型',
			dataIndex: 'userType'
		},
		{
			title: '处理时间',
			dataIndex: 'processTime'
		},
		{
			title: '解决时间',
			dataIndex: 'resolveTime'
		},
		{
			title: '处理结果',
			dataIndex: 'resolveResult'
		},
		{
			title: '满意度评分（1-5分）',
			dataIndex: 'satisfaction'
		},
		{
			title: '评价内容',
			dataIndex: 'evaluation'
		},
		{
			title: '排序码',
			dataIndex: 'sortCode'
		}
	]
	// 操作栏通过权限判断是否显示
	if (hasPerm(['bizFeedbackReply', 'bizFeedbackEdit', 'bizFeedbackDelete'])) {
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
		return bizFeedbackApi.bizFeedbackPage(Object.assign(parameter, searchFormParam)).then((data) => {
			return data
		})
	}
	// 重置
	const reset = () => {
		searchFormRef.value.resetFields()
		tableRef.value.refresh(true)
	}
	// 删除
	const deleteBizFeedback = (record) => {
		let params = [
			{
				id: record.id
			}
		]
		bizFeedbackApi.bizFeedbackDelete(params).then(() => {
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
			bizFeedbackApi.bizFeedbackExport(params).then((res) => {
				downloadUtil.resultDownload(res)
			})
		} else {
			bizFeedbackApi.bizFeedbackExport([]).then((res) => {
				downloadUtil.resultDownload(res)
			})
		}
	}
	// 批量删除
	const deleteBatchBizFeedback = (params) => {
		bizFeedbackApi.bizFeedbackDelete(params).then(() => {
			tableRef.value.clearRefreshSelected()
		})
	}
	
	// 反馈类型映射（与前端保持一致）
	const feedbackTypeMap = {
		FEATURE_SUGGESTION: { label: '功能建议', color: 'red' },
		BUG_REPORT: { label: '问题反馈', color: 'orange' },
		ACTIVITY_INQUIRY: { label: '活动咨询', color: 'blue' },
		COMPLAINT: { label: '投诉建议', color: 'green' },
		OTHER: { label: '其他', color: 'default' }
	}
	
	// 获取类型文本
	const getTypeText = (type) => {
		return feedbackTypeMap[type]?.label || type
	}
	
	// 获取类型颜色
	const getTypeColor = (type) => {
		return feedbackTypeMap[type]?.color || 'default'
	}
</script>
