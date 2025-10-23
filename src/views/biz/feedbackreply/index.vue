<template>
	<a-card :bordered="false" style="width: 100%">
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
					<a-button type="primary" @click="formRef.onOpen()" v-if="hasPerm('bizFeedbackReplyAdd')">
						<template #icon><plus-outlined /></template>
						新增
					</a-button>
					<a-button @click="importModelRef.onOpen()" v-if="hasPerm('bizFeedbackReplyImport')">
                        <template #icon><import-outlined /></template>
                        <span>导入</span>
                    </a-button>
                    <a-button @click="exportData" v-if="hasPerm('bizFeedbackReplyExport')">
                        <template #icon><export-outlined /></template>
                        <span>导出</span>
                    </a-button>
					<xn-batch-button
						v-if="hasPerm('bizFeedbackReplyBatchDelete')"
						buttonName="批量删除"
						icon="DeleteOutlined"
						buttonDanger
						:selectedRowKeys="selectedRowKeys"
						@batchCallBack="deleteBatchBizFeedbackReply"
					/>
				</a-space>
			</template>
			<template #bodyCell="{ column, record }">
				<template v-if="column.dataIndex === 'replyType'">
					{{ $TOOL.dictTypeData('COMMON_STATUS', record.replyType) }}
				</template>
				<template v-if="column.dataIndex === 'isInternal'">
					{{ $TOOL.dictTypeData('COMMON_SWITCH', record.isInternal) }}
				</template>
				<template v-if="column.dataIndex === 'action'">
					<a-space>
						<a @click="formRef.onOpen(record)" v-if="hasPerm('bizFeedbackReplyEdit')">编辑</a>
						<a-divider type="vertical" v-if="hasPerm(['bizFeedbackReplyEdit', 'bizFeedbackReplyDelete'], 'and')" />
						<a-popconfirm title="确定要删除吗？" @confirm="deleteBizFeedbackReply(record)">
							<a-button type="link" danger size="small" v-if="hasPerm('bizFeedbackReplyDelete')">删除</a-button>
						</a-popconfirm>
					</a-space>
				</template>
			</template>
		</s-table>
	</a-card>
	<ImportModel ref="importModelRef" />
	<Form ref="formRef" @successful="tableRef.refresh()" />
</template>

<script setup name="feedbackreply">
	import { cloneDeep } from 'lodash-es'
	import Form from './form.vue'
	import ImportModel from './importModel.vue'
	import downloadUtil from '@/utils/downloadUtil'
	import bizFeedbackReplyApi from '@/api/biz/bizFeedbackReplyApi'
	const tableRef = ref()
	const importModelRef = ref()
	const formRef = ref()
	const toolConfig = { refresh: true, height: true, columnSetting: true, striped: false }
	const columns = [
		{
			title: '反馈ID',
			dataIndex: 'feedbackId'
		},
		{
			title: '回复内容',
			dataIndex: 'content'
		},
		{
			title: '回复类型',
			dataIndex: 'replyType'
		},
		{
			title: '回复人ID',
			dataIndex: 'replyUserId'
		},
		{
			title: '回复人姓名',
			dataIndex: 'replyUserName'
		},
		{
			title: '是否内部回复',
			dataIndex: 'isInternal'
		},
		{
			title: '附件URL',
			dataIndex: 'attachmentUrl'
		},
	]
	// 操作栏通过权限判断是否显示
	if (hasPerm(['bizFeedbackReplyEdit', 'bizFeedbackReplyDelete'])) {
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
		return bizFeedbackReplyApi.bizFeedbackReplyPage(parameter).then((data) => {
			return data
		})
	}
	// 重置
	const reset = () => {
		searchFormRef.value.resetFields()
		tableRef.value.refresh(true)
	}
	// 删除
	const deleteBizFeedbackReply = (record) => {
		let params = [
			{
				id: record.id
			}
		]
		bizFeedbackReplyApi.bizFeedbackReplyDelete(params).then(() => {
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
            bizFeedbackReplyApi.bizFeedbackReplyExport(params).then((res) => {
                downloadUtil.resultDownload(res)
            })
        } else {
            bizFeedbackReplyApi.bizFeedbackReplyExport([]).then((res) => {
                downloadUtil.resultDownload(res)
            })
        }
    }
	// 批量删除
	const deleteBatchBizFeedbackReply = (params) => {
		bizFeedbackReplyApi.bizFeedbackReplyDelete(params).then(() => {
			tableRef.value.clearRefreshSelected()
		})
	}
</script>
