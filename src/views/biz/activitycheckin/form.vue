<template>
	<xn-form-container
		:title="formData.id ? '编辑活动签到表' : '增加活动签到表'"
		:width="700"
		v-model:open="open"
		:destroy-on-close="true"
		@close="onClose"
	>
		<a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
			<a-row :gutter="16">
				<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
					<a-form-item label="活动ID：" name="activityId">
						<a-input v-model:value="formData.activityId" placeholder="请输入活动ID" allow-clear />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
					<a-form-item label="用户ID：" name="userId">
						<a-input v-model:value="formData.userId" placeholder="请输入用户ID" allow-clear />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
					<a-form-item label="报名记录ID：" name="signupId">
						<a-input v-model:value="formData.signupId" placeholder="请输入报名记录ID" allow-clear />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
					<a-form-item label="签到类型：CHECKIN-签到，CHECKOUT-签退：" name="checkinType">
						<a-input v-model:value="formData.checkinType" placeholder="请输入签到类型：CHECKIN-签到，CHECKOUT-签退" allow-clear />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
					<a-form-item label="签到时间：" name="checkinTime">
						<a-date-picker v-model:value="formData.checkinTime" value-format="YYYY-MM-DD HH:mm:ss" show-time placeholder="请选择签到时间" style="width: 100%" />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
					<a-form-item label="签到地点：" name="location">
						<a-input v-model:value="formData.location" placeholder="请输入签到地点" allow-clear />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
					<a-form-item label="签到纬度：" name="locationLat">
						<a-input v-model:value="formData.locationLat" placeholder="请输入签到纬度" allow-clear />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
					<a-form-item label="签到经度：" name="locationLng">
						<a-input v-model:value="formData.locationLng" placeholder="请输入签到经度" allow-clear />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
					<a-form-item label="设备信息：" name="deviceInfo">
						<a-input v-model:value="formData.deviceInfo" placeholder="请输入设备信息" allow-clear />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
					<a-form-item label="签到照片URL：" name="photoUrl">
						<a-input v-model:value="formData.photoUrl" placeholder="请输入签到照片URL" allow-clear />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
					<a-form-item label="备注：" name="remark">
						<a-input v-model:value="formData.remark" placeholder="请输入备注" allow-clear />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
					<a-form-item label="状态：NORMAL-正常，LATE-迟到，EARLY_LEAVE-早退，ABSENTEEISM-旷工：" name="status">
						<a-input v-model:value="formData.status" placeholder="请输入状态：NORMAL-正常，LATE-迟到，EARLY_LEAVE-早退，ABSENTEEISM-旷工" allow-clear />
					</a-form-item>
				</a-col>
			</a-row>
		</a-form>
		<template #footer>
			<a-button style="margin-right: 8px" @click="onClose">关闭</a-button>
			<a-button type="primary" @click="onSubmit" :loading="submitLoading">保存</a-button>
		</template>
	</xn-form-container>
</template>

<script setup name="volActivityCheckinForm">
	import { cloneDeep } from 'lodash-es'
	import { required } from '@/utils/formRules'
	import volActivityCheckinApi from '@/api/biz/volActivityCheckinApi'
	// 抽屉状态
	const open = ref(false)
	const emit = defineEmits({ successful: null })
	const formRef = ref()
	// 表单数据
	const formData = ref({})
	const submitLoading = ref(false)

	// 打开抽屉
	const onOpen = (record) => {
		open.value = true
		if (record) {
			let recordData = cloneDeep(record)
			formData.value = Object.assign({}, recordData)
		}
	}
	// 关闭抽屉
	const onClose = () => {
		formRef.value.resetFields()
		formData.value = {}
		open.value = false
	}
	// 默认要校验的
	const formRules = {
	}
	// 验证并提交数据
	const onSubmit = () => {
		formRef.value
			.validate()
			.then(() => {
				submitLoading.value = true
				const formDataParam = cloneDeep(formData.value)
				volActivityCheckinApi
					.volActivityCheckinSubmitForm(formDataParam, formDataParam.id)
					.then(() => {
						onClose()
						emit('successful')
					})
					.finally(() => {
						submitLoading.value = false
					})
			})
			.catch(() => {})
	}
	// 抛出函数
	defineExpose({
		onOpen
	})
</script>
