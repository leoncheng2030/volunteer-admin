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
					<a-button type="primary" @click="formRef.onOpen()" v-if="hasPerm('volActivityCheckinAdd')">
						<template #icon><plus-outlined /></template>
						新增
					</a-button>
					<a-button @click="importModelRef.onOpen()" v-if="hasPerm('volActivityCheckinImport')">
                        <template #icon><import-outlined /></template>
                        <span>导入</span>
                    </a-button>
                    <a-button @click="exportData" v-if="hasPerm('volActivityCheckinExport')">
                        <template #icon><export-outlined /></template>
                        <span>导出</span>
                    </a-button>
					<xn-batch-button
						v-if="hasPerm('volActivityCheckinBatchDelete')"
						buttonName="批量删除"
						icon="DeleteOutlined"
						buttonDanger
						:selectedRowKeys="selectedRowKeys"
						@batchCallBack="deleteBatchVolActivityCheckin"
					/>
				</a-space>
			</template>
			<template #bodyCell="{ column, record }">
				<template v-if="column.dataIndex === 'action'">
					<a-space>
						<a @click="formRef.onOpen(record)" v-if="hasPerm('volActivityCheckinEdit')">编辑</a>
						<a-divider type="vertical" v-if="hasPerm(['volActivityCheckinEdit', 'volActivityCheckinDelete'], 'and')" />
						<a-popconfirm title="确定要删除吗？" @confirm="deleteVolActivityCheckin(record)">
							<a-button type="link" danger size="small" v-if="hasPerm('volActivityCheckinDelete')">删除</a-button>
						</a-popconfirm>
					</a-space>
				</template>
			</template>
		</s-table>
	</a-card>
	<ImportModel ref="importModelRef" />
	<Form ref="formRef" @successful="tableRef.refresh()" />
</template>

<script setup name="activitycheckin">
	import { cloneDeep } from 'lodash-es'
	import Form from './form.vue'
	import ImportModel from './importModel.vue'
	import downloadUtil from '@/utils/downloadUtil'
	import volActivityCheckinApi from '@/api/biz/volActivityCheckinApi'
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
			title: '报名记录ID',
			dataIndex: 'signupId'
		},
		{
			title: '签到类型：CHECKIN-签到，CHECKOUT-签退',
			dataIndex: 'checkinType'
		},
		{
			title: '签到时间',
			dataIndex: 'checkinTime'
		},
		{
			title: '签到地点',
			dataIndex: 'location'
		},
		{
			title: '签到纬度',
			dataIndex: 'locationLat'
		},
		{
			title: '签到经度',
			dataIndex: 'locationLng'
		},
		{
			title: '设备信息',
			dataIndex: 'deviceInfo'
		},
		{
			title: '签到照片URL',
			dataIndex: 'photoUrl'
		},
		{
			title: '备注',
			dataIndex: 'remark'
		},
		{
			title: '状态：NORMAL-正常，LATE-迟到，EARLY_LEAVE-早退，ABSENTEEISM-旷工',
			dataIndex: 'status'
		},
	]
	// 操作栏通过权限判断是否显示
	if (hasPerm(['volActivityCheckinEdit', 'volActivityCheckinDelete'])) {
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
		return volActivityCheckinApi.volActivityCheckinPage(parameter).then((data) => {
			return data
		})
	}
	// 重置
	const reset = () => {
		searchFormRef.value.resetFields()
		tableRef.value.refresh(true)
	}
	// 删除
	const deleteVolActivityCheckin = (record) => {
		let params = [
			{
				id: record.id
			}
		]
		volActivityCheckinApi.volActivityCheckinDelete(params).then(() => {
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
            volActivityCheckinApi.volActivityCheckinExport(params).then((res) => {
                downloadUtil.resultDownload(res)
            })
        } else {
            volActivityCheckinApi.volActivityCheckinExport([]).then((res) => {
                downloadUtil.resultDownload(res)
            })
        }
    }
	// 批量删除
	const deleteBatchVolActivityCheckin = (params) => {
		volActivityCheckinApi.volActivityCheckinDelete(params).then(() => {
			tableRef.value.clearRefreshSelected()
		})
	}
</script>
