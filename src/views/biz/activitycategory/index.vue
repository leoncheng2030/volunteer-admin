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
					<a-button type="primary" @click="formRef.onOpen()" v-if="hasPerm('volActivityCategoryAdd')">
						<template #icon><plus-outlined /></template>
						新增
					</a-button>
					<a-button @click="importModelRef.onOpen()" v-if="hasPerm('volActivityCategoryImport')">
                        <template #icon><import-outlined /></template>
                        <span>导入</span>
                    </a-button>
                    <a-button @click="exportData" v-if="hasPerm('volActivityCategoryExport')">
                        <template #icon><export-outlined /></template>
                        <span>导出</span>
                    </a-button>
					<xn-batch-button
						v-if="hasPerm('volActivityCategoryBatchDelete')"
						buttonName="批量删除"
						icon="DeleteOutlined"
						buttonDanger
						:selectedRowKeys="selectedRowKeys"
						@batchCallBack="deleteBatchVolActivityCategory"
					/>
				</a-space>
			</template>
			<template #bodyCell="{ column, record }">
				<template v-if="column.dataIndex === 'status'">
					{{ $TOOL.dictTypeData('COMMON_STATUS', record.status) }}
				</template>
				<template v-if="column.dataIndex === 'action'">
					<a-space>
						<a @click="formRef.onOpen(record)" v-if="hasPerm('volActivityCategoryEdit')">编辑</a>
						<a-divider type="vertical" v-if="hasPerm(['volActivityCategoryEdit', 'volActivityCategoryDelete'], 'and')" />
						<a-popconfirm title="确定要删除吗？" @confirm="deleteVolActivityCategory(record)">
							<a-button type="link" danger size="small" v-if="hasPerm('volActivityCategoryDelete')">删除</a-button>
						</a-popconfirm>
					</a-space>
				</template>
			</template>
		</s-table>
	</a-card>
	<ImportModel ref="importModelRef" />
	<Form ref="formRef" @successful="tableRef.refresh()" />
</template>

<script setup name="activitycategory">
	import { cloneDeep } from 'lodash-es'
	import Form from './form.vue'
	import ImportModel from './importModel.vue'
	import downloadUtil from '@/utils/downloadUtil'
	import volActivityCategoryApi from '@/api/biz/volActivityCategoryApi'
	const tableRef = ref()
	const importModelRef = ref()
	const formRef = ref()
	const toolConfig = { refresh: true, height: true, columnSetting: true, striped: false }
	const columns = [
		{
			title: '分类名称',
			dataIndex: 'name'
		},
		{
			title: '分类编码',
			dataIndex: 'code'
		},
		{
			title: '分类描述',
			dataIndex: 'description'
		},
		{
			title: '父分类ID',
			dataIndex: 'parentId'
		},
		{
			title: '排序码',
			dataIndex: 'sortCode'
		},
		{
			title: '状态',
			dataIndex: 'status'
		},
		{
			title: '扩展信息',
			dataIndex: 'extJson'
		},
	]
	// 操作栏通过权限判断是否显示
	if (hasPerm(['volActivityCategoryEdit', 'volActivityCategoryDelete'])) {
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
		return volActivityCategoryApi.volActivityCategoryPage(parameter).then((data) => {
			return data
		})
	}
	// 重置
	const reset = () => {
		searchFormRef.value.resetFields()
		tableRef.value.refresh(true)
	}
	// 删除
	const deleteVolActivityCategory = (record) => {
		let params = [
			{
				id: record.id
			}
		]
		volActivityCategoryApi.volActivityCategoryDelete(params).then(() => {
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
            volActivityCategoryApi.volActivityCategoryExport(params).then((res) => {
                downloadUtil.resultDownload(res)
            })
        } else {
            volActivityCategoryApi.volActivityCategoryExport([]).then((res) => {
                downloadUtil.resultDownload(res)
            })
        }
    }
	// 批量删除
	const deleteBatchVolActivityCategory = (params) => {
		volActivityCategoryApi.volActivityCategoryDelete(params).then(() => {
			tableRef.value.clearRefreshSelected()
		})
	}
</script>
