<template>
	<xn-form-container
		:title="formData.id ? '编辑反馈回复' : '增加反馈回复'"
		:width="700"
		v-model:open="open"
		:destroy-on-close="true"
		@close="onClose"
	>
		<a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
			<a-row :gutter="16">
				<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
					<a-form-item label="反馈ID：" name="feedbackId">
						<a-input v-model:value="formData.feedbackId" placeholder="请输入反馈ID" allow-clear />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
					<a-form-item label="回复内容：" name="content">
						<a-textarea v-model:value="formData.content" placeholder="请输入回复内容" :auto-size="{ minRows: 3, maxRows: 5 }" />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
					<a-form-item label="回复类型：" name="replyType">
						<a-select v-model:value="formData.replyType" placeholder="请选择回复类型" :options="replyTypeOptions" />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
					<a-form-item label="回复人ID：" name="replyUserId">
						<a-input v-model:value="formData.replyUserId" placeholder="请输入回复人ID" allow-clear />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
					<a-form-item label="回复人姓名：" name="replyUserName">
						<a-input v-model:value="formData.replyUserName" placeholder="请输入回复人姓名" allow-clear />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
					<a-form-item label="是否内部回复：" name="isInternal">
						<a-select v-model:value="formData.isInternal" placeholder="请选择是否内部回复" :options="isInternalOptions" />
					</a-form-item>
				</a-col>
				<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
					<a-form-item label="附件URL：" name="attachmentUrl">
						<a-input v-model:value="formData.attachmentUrl" placeholder="请输入附件URL" allow-clear />
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

<script setup name="bizFeedbackReplyForm">
	import tool from '@/utils/tool'
	import { cloneDeep } from 'lodash-es'
	import { required } from '@/utils/formRules'
	import bizFeedbackReplyApi from '@/api/biz/bizFeedbackReplyApi'
	// 抽屉状态
	const open = ref(false)
	const emit = defineEmits({ successful: null })
	const formRef = ref()
	// 表单数据
	const formData = ref({})
	const submitLoading = ref(false)
	const replyTypeOptions = ref([])
	const isInternalOptions = ref([])

	// 打开抽屉
	const onOpen = (record) => {
		open.value = true
		if (record) {
			let recordData = cloneDeep(record)
			formData.value = Object.assign({}, recordData)
		}
		replyTypeOptions.value = tool.dictList('COMMON_STATUS')
		isInternalOptions.value = tool.dictList('COMMON_SWITCH')
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
				bizFeedbackReplyApi
					.bizFeedbackReplySubmitForm(formDataParam, formDataParam.id)
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
