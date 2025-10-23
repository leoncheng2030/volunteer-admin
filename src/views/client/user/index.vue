<template>
	<div>
		<a-card :bordered="false" style="margin-bottom: 10px">
			<a-form ref="searchFormRef" :model="searchFormState">
				<a-row :gutter="10">
					<a-col :span="6">
						<a-form-item name="searchKey" label="用户关键词">
							<a-input v-model:value="searchFormState.searchKey" placeholder="请输入用户关键词" />
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-form-item name="type" label="用户类型">
							<a-select v-model:value="searchFormState.type" placeholder="请选择用户类型" allow-clear>
								<a-select-option value="volunteer">小雷锋</a-select-option>
								<a-select-option value="guardian">监护人</a-select-option>
							</a-select>
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-form-item name="auditStatus" label="审核状态">
							<a-select v-model:value="searchFormState.auditStatus" placeholder="请选择审核状态" allow-clear>
								<a-select-option value="PENDING">待审核</a-select-option>
								<a-select-option value="APPROVED">已通过</a-select-option>
								<a-select-option value="REJECTED">已拒绝</a-select-option>
							</a-select>
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-button type="primary" @click="tableRef.refresh(true)">
							<template #icon><SearchOutlined /></template>
							查询
						</a-button>
						<a-button @click="reset">
							<template #icon><redo-outlined /></template>
							重置
						</a-button>
					</a-col>
				</a-row>
			</a-form>
		</a-card>
		<a-card :bordered="false">
			<s-table
				ref="tableRef"
				:columns="columns"
				:data="loadData"
				:expand-row-by-click="true"
				bordered
				:alert="options.alert.show"
				:tool-config="toolConfig"
				:row-key="(record) => record.id"
				:row-selection="options.rowSelection"
				:scroll="{ x: 'max-content' }"
			>
				<template #operator class="table-operator">
					<a-space>
						<a-button type="primary" @click="clientUserFormRef.onOpen()">
							<template #icon><plus-outlined /></template>
							<span>新增用户</span>
						</a-button>
						<xn-batch-button
							buttonName="批量删除"
							icon="DeleteOutlined"
							buttonDanger
							:selectedRowKeys="selectedRowKeys"
							@batchCallBack="deleteBatchUser"
						/>
					</a-space>
				</template>
				<template #bodyCell="{ column, record }">
					<template v-if="column.dataIndex === 'avatar'">
						<a-avatar :src="record.avatar" style="margin-bottom: -5px; margin-top: -5px" />
					</template>
					<template v-if="column.dataIndex === 'gender'">
						{{ $TOOL.dictTypeData('GENDER', record.gender) }}
					</template>
					<template v-if="column.dataIndex === 'userStatus'">
						{{ $TOOL.dictTypeData('COMMON_STATUS', record.userStatus) }}
					</template>
					<template v-if="column.dataIndex === 'auditStatus'">
						<a-tag v-if="record.type === 'volunteer'" :color="getAuditStatusColor(record.auditStatus)">
							{{ getAuditStatusText(record.auditStatus) }}
						</a-tag>
						<span v-else>-</span>
					</template>
					<template v-if="column.dataIndex === 'action'">
						<a-space>
							<a @click="clientUserFormRef.onOpen(record)">编辑</a>
							<a-divider type="vertical" v-if="record.type === 'volunteer' && record.auditStatus === 'PENDING'" />
							<a @click="auditVolunteer(record)" v-if="record.type === 'volunteer' && record.auditStatus === 'PENDING'">审核</a>
							<a-divider type="vertical" />
							<a-popconfirm title="确定要删除此用户吗" @confirm="removeUser(record)">
								<a-button type="link" danger size="small"> 删除 </a-button>
							</a-popconfirm>
						</a-space>
					</template>
				</template>
			</s-table>
		</a-card>
		<client-user-form ref="clientUserFormRef" @successful="tableRef.refresh()" />
		
		<!-- 小雷锋审核弹窗组件 -->
		<audit-modal 
			:visible="auditModalVisible" 
			@update:visible="auditModalVisible = $event"
			:record="auditRecord"
			@success="handleAuditSuccess"
		/>
	</div>
</template>
<script setup name="clientUser">
	import { message } from 'ant-design-vue'
	import clientUserApi from '@/api/client/clientUserApi'
	import ClientUserForm from './form.vue'
	import AuditModal from './AuditModal.vue'

	const columns = [
		{
			title: '头像',
			dataIndex: 'avatar',
			align: 'center'
		},
		{
			title: '账号',
			dataIndex: 'account',
			ellipsis: true
		},
		{
			title: '姓名',
			dataIndex: 'name'
		},
		{
			title: '性别',
			dataIndex: 'gender'
		},
		{
			title: '手机',
			dataIndex: 'phone',
			ellipsis: true
		},
		{
			title: '状态',
			dataIndex: 'userStatus'
		},
		{
			title: '审核状态',
			dataIndex: 'auditStatus'
		},
		{
			title: '操作',
			dataIndex: 'action',
			align: 'center'
		}
	]
	const toolConfig = { refresh: true, height: true, columnSetting: true }
	const searchFormRef = ref()
	const searchFormState = ref({})
	const tableRef = ref(null)
	const selectedRowKeys = ref([])
	const clientUserFormRef = ref(null)
	// 表格查询 返回 Promise 对象
	const loadData = (parameter) => {
		return clientUserApi.userPage(Object.assign(parameter, searchFormState.value)).then((res) => {
			return res
		})
	}
	// 重置
	const reset = () => {
		searchFormRef.value.resetFields()
		tableRef.value.refresh(true)
	}
	// 列表选择配置
	const options = {
		alert: {
			show: false,
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
	// 删除用户
	const removeUser = (record) => {
		let params = [
			{
				id: record.id
			}
		]
		clientUserApi.userDelete(params).then(() => {
			tableRef.value.refresh()
		})
	}
	// 批量删除
	const deleteBatchUser = (params) => {
		clientUserApi.userDelete(params).then(() => {
			tableRef.value.clearRefreshSelected()
		})
	}
	// 重置用户密码
	const resetPassword = (record) => {
		clientUserApi.userResetPassword(record).then(() => {})
	}
	
	// 审核相关
	const auditModalVisible = ref(false)
	const auditRecord = ref(null)
	
	// 获取审核状态颜色
	const getAuditStatusColor = (status) => {
		const colorMap = {
			'PENDING': 'orange',
			'APPROVED': 'green',
			'REJECTED': 'red'
		}
		return colorMap[status] || 'default'
	}
	
	// 获取审核状态文本
	const getAuditStatusText = (status) => {
		const textMap = {
			'PENDING': '待审核',
			'APPROVED': '已通过',
			'REJECTED': '已拒绝'
		}
		return textMap[status] || status
	}
	
	// 打开审核弹窗
	const auditVolunteer = (record) => {
		auditRecord.value = record
		auditModalVisible.value = true
	}
	
	// 审核成功回调
	const handleAuditSuccess = () => {
		tableRef.value.refresh()
	}
</script>

<style lang="less" scoped>
	.ant-form-item {
		margin-bottom: 0 !important;
	}
	.snowy-table-avatar {
		margin-top: -10px;
		margin-bottom: -10px;
	}
	.snowy-button-left {
		margin-left: 8px;
	}
</style>