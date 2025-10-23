<template>
	<a-modal
		:open="visible"
		title="小雷锋审核"
		:width="800"
		@ok="handleOk"
		@cancel="handleCancel"
	>
		<a-spin :spinning="loading">
			<a-descriptions :column="2" bordered v-if="record">
				<a-descriptions-item label="头像" :span="2">
					<a-avatar :src="record.avatar" :size="80" />
				</a-descriptions-item>
				
				<a-descriptions-item label="姓名">
					{{ record.name }}
				</a-descriptions-item>
				<a-descriptions-item label="性别">
					{{ $TOOL.dictTypeData('GENDER', record.gender) }}
				</a-descriptions-item>
				
				<a-descriptions-item label="年龄">
					{{ record.age }}
				</a-descriptions-item>
				<a-descriptions-item label="出生日期">
					{{ record.birthday }}
				</a-descriptions-item>
				
				<a-descriptions-item label="证件类型">
					{{ record.idCardType || '-' }}
				</a-descriptions-item>
				<a-descriptions-item label="证件号码">
					{{ record.idCardNumber || '-' }}
				</a-descriptions-item>
				<a-descriptions-item label="民族">
					{{ record.nation }}
				</a-descriptions-item>
				
				<a-descriptions-item label="手机号">
					{{ record.phone }}
				</a-descriptions-item>
				<a-descriptions-item label="邮箱">
					{{ record.email || '-' }}
				</a-descriptions-item>
				
				<a-descriptions-item label="家庭住址" :span="2">
					{{ record.homeAddress }}
				</a-descriptions-item>
				
				<a-descriptions-item label="通信地址" :span="2">
					{{ record.mailingAddress || '-' }}
				</a-descriptions-item>
				
				<a-descriptions-item label="文化程度">
					{{ record.cultureLevel || '-' }}
				</a-descriptions-item>
				<a-descriptions-item label="政治面貌">
					{{ record.politicalOutlook || '-' }}
				</a-descriptions-item>
				
				<a-descriptions-item label="毕业院校">
					{{ record.college || '-' }}
				</a-descriptions-item>
				<a-descriptions-item label="学历">
					{{ record.education || '-' }}
				</a-descriptions-item>
				
				<a-descriptions-item label="紧急联系人">
					{{ record.emergencyContact || '-' }}
				</a-descriptions-item>
				<a-descriptions-item label="紧急联系人电话">
					{{ record.emergencyPhone || '-' }}
				</a-descriptions-item>
				
				<!-- 监护人信息 -->
				<template v-if="parentInfo">
					<a-descriptions-item label="监护人姓名">
						{{ parentInfo.parentName }}
					</a-descriptions-item>
					<a-descriptions-item label="监护人电话">
						{{ parentInfo.parentPhone }}
					</a-descriptions-item>
				</template>
				
				<!-- 审核历史信息 -->
				<template v-if="record.auditStatus !== 'PENDING'">
					<a-descriptions-item label="审核状态" :span="2">
						<a-tag :color="getAuditStatusColor(record.auditStatus)">
							{{ getAuditStatusText(record.auditStatus) }}
						</a-tag>
					</a-descriptions-item>
					<a-descriptions-item label="审核时间">
						{{ formatDateTime(record.auditTime) }}
					</a-descriptions-item>
					<a-descriptions-item label="审核原因">
						{{ record.auditReason || '-' }}
					</a-descriptions-item>
				</template>
			</a-descriptions>
			
			<a-divider>审核操作</a-divider>
			
			<a-form :model="form" layout="vertical">
				<a-form-item label="审核结果" required>
					<a-radio-group v-model:value="form.result">
						<a-radio value="APPROVED">审核通过</a-radio>
						<a-radio value="REJECTED">审核拒绝</a-radio>
					</a-radio-group>
				</a-form-item>
				
				<a-form-item 
					label="审核原因" 
					v-if="form.result === 'REJECTED'"
					required
				>
					<a-textarea
						v-model:value="form.reason"
						placeholder="请输入拒绝原因"
						:rows="4"
						:maxlength="500"
						show-count
					/>
				</a-form-item>
			</a-form>
		</a-spin>
	</a-modal>
</template>

<script setup>
	import { message } from 'ant-design-vue'
	import { ref, watch, computed } from 'vue'
	import clientUserApi from '@/api/client/clientUserApi'
	import dayjs from 'dayjs'
	
	const props = defineProps({
		visible: {
			type: Boolean,
			default: false
		},
		record: {
			type: Object,
			default: null
		}
	})
	
	const emit = defineEmits(['update:visible', 'success'])
	
	const loading = ref(false)
	const form = ref({
		result: 'APPROVED',
		reason: ''
	})
	
	// 解析监护人信息
	const parentInfo = computed(() => {
		if (!props.record?.extJson) return null
		try {
			return JSON.parse(props.record.extJson)
		} catch (e) {
			return null
		}
	})
	
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
	
	// 格式化日期时间
	const formatDateTime = (dateTime) => {
		if (!dateTime) return '-'
		return dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss')
	}
	
	// 监听visible变化
	watch(() => props.visible, (newVal) => {
		if (newVal) {
			// 重置表单
			form.value = {
				result: 'APPROVED',
				reason: ''
			}
		}
	})
	
	// 确认审核
	const handleOk = async () => {
		if (form.value.result === 'REJECTED' && !form.value.reason.trim()) {
			message.warning('请输入拒绝原因')
			return
		}
		
		try {
			loading.value = true
			if (form.value.result === 'APPROVED') {
				await clientUserApi.approveVolunteer({ id: props.record.id })
				message.success('审核通过成功')
			} else {
				await clientUserApi.rejectVolunteer({
					id: props.record.id,
					reason: form.value.reason
				})
				message.success('审核拒绝成功')
			}
			emit('success')
			handleCancel()
		} catch (error) {
			message.error('审核操作失败: ' + error.message)
		} finally {
			loading.value = false
		}
	}
	
	// 取消审核
	const handleCancel = () => {
		emit('update:visible', false)
	}
</script>

<style lang="less" scoped>
</style>