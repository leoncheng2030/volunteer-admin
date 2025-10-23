<template>
	<a-card :bordered="false" style="width: 100%">
		<a-form ref="searchFormRef" :model="searchFormState">
			<a-row :gutter="10">
				<a-col :xs="24" :sm="6" :md="6" :lg="6" :xl="6">
					<a-form-item label="活动ID" name="activityId">
						<a-input v-model:value="searchFormState.activityId" placeholder="请输入活动ID" />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="6" :md="6" :lg="6" :xl="6">
					<a-form-item label="用户ID" name="userId">
						<a-input v-model:value="searchFormState.userId" placeholder="请输入用户ID" />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="6" :md="6" :lg="6" :xl="6">
					<a-form-item label="报名状态" name="status">
						<a-select v-model:value="searchFormState.status" placeholder="请选择报名状态" :options="statusOptions" />
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
					<a-button type="primary" @click="formRef.onOpen()" v-if="hasPerm('volActivitySignupAdd')">
						<template #icon><plus-outlined /></template>
						新增
					</a-button>
					<a-button @click="importModelRef.onOpen()" v-if="hasPerm('volActivitySignupImport')">
                        <template #icon><import-outlined /></template>
                        <span>导入</span>
                    </a-button>
                    <a-button @click="exportData" v-if="hasPerm('volActivitySignupExport')">
                        <template #icon><export-outlined /></template>
                        <span>导出</span>
                    </a-button>
					<xn-batch-button
						v-if="hasPerm('volActivitySignupBatchDelete')"
						buttonName="批量删除"
						icon="DeleteOutlined"
						buttonDanger
						:selectedRowKeys="selectedRowKeys"
						@batchCallBack="deleteBatchVolActivitySignup"
					/>
				</a-space>
			</template>
			<template #bodyCell="{ column, record }">
				<template v-if="column.dataIndex === 'status'">
					{{ $TOOL.dictTypeData('VOL_SIGNUP_STATUS', record.status) }}
				</template>
				<template v-if="column.dataIndex === 'action'">
					<a-space>
						<a @click="formRef.onOpen(record)" v-if="hasPerm('volActivitySignupEdit')">编辑</a>
						<a-divider type="vertical" v-if="hasPerm(['volActivitySignupEdit', 'volActivitySignupDelete'], 'and')" />
						<a-popconfirm title="确定要删除吗？" @confirm="deleteVolActivitySignup(record)">
							<a-button type="link" danger size="small" v-if="hasPerm('volActivitySignupDelete')">删除</a-button>
						</a-popconfirm>
					</a-space>
				</template>
			</template>
		</s-table>
	</a-card>
	<ImportModel ref="importModelRef" />
	<Form ref="formRef" @successful="tableRef.refresh()" />
</template>

<script setup name="activitysignup">
	import tool from '@/utils/tool'
	import { cloneDeep } from 'lodash-es'
	import Form from './form.vue'
	import ImportModel from './importModel.vue'
	import downloadUtil from '@/utils/downloadUtil'
	import volActivitySignupApi from '@/api/biz/volActivitySignupApi'
	const searchFormState = ref({})
	const searchFormRef = ref()
	const tableRef = ref()
	const importModelRef = ref()
	const formRef = ref()
	const toolConfig = { refresh: true, height: true, columnSetting: true, striped: false }
	const columns = [
		{
			title: '活动ID',
			dataIndex: 'activityId'
		},
		{
			title: '用户ID',
			dataIndex: 'userId'
		},
		{
			title: '报名时间',
			dataIndex: 'signupTime'
		},
		{
			title: '报名状态',
			dataIndex: 'status'
		},
		{
			title: '取消时间',
			dataIndex: 'cancelTime'
		},
		{
			title: '取消原因',
			dataIndex: 'cancelReason'
		},
		{
			title: '签到时间',
			dataIndex: 'checkInTime'
		},
		{
			title: '实际服务时长',
			dataIndex: 'serviceHoursActual'
		},
		{
			title: '备注',
			dataIndex: 'remark'
		},
		{
			title: '扩展信息',
			dataIndex: 'extJson'
		},
	]
	// 操作栏通过权限判断是否显示
	if (hasPerm(['volActivitySignupEdit', 'volActivitySignupDelete'])) {
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
		return volActivitySignupApi.volActivitySignupPage(Object.assign(parameter, searchFormParam)).then((data) => {
			return data
		})
	}
	// 重置
	const reset = () => {
		searchFormRef.value.resetFields()
		tableRef.value.refresh(true)
	}
	// 删除
	const deleteVolActivitySignup = (record) => {
		let params = [
			{
				id: record.id
			}
		]
		volActivitySignupApi.volActivitySignupDelete(params).then(() => {
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
            volActivitySignupApi.volActivitySignupExport(params).then((res) => {
                downloadUtil.resultDownload(res)
            })
        } else {
            volActivitySignupApi.volActivitySignupExport([]).then((res) => {
                downloadUtil.resultDownload(res)
            })
        }
    }
	// 批量删除
	const deleteBatchVolActivitySignup = (params) => {
		volActivitySignupApi.volActivitySignupDelete(params).then(() => {
			tableRef.value.clearRefreshSelected()
		})
	}
	const statusOptions = tool.dictList('VOL_SIGNUP_STATUS')
</script>
