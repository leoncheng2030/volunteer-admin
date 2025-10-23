<template>
	<xn-form-container
		:title="formData.id ? '编辑用户反馈' : '增加用户反馈'"
		:width="700"
		v-model:open="open"
		:destroy-on-close="true"
		@close="onClose"
	>
		<a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
			<a-form-item label="反馈标题：" name="title">
				<a-input v-model:value="formData.title" placeholder="请输入反馈标题" allow-clear />
			</a-form-item>
			<a-form-item label="反馈内容：" name="content">
				<a-input v-model:value="formData.content" placeholder="请输入反馈内容" allow-clear />
			</a-form-item>
			<a-form-item label="反馈类型：" name="type">
				<a-input v-model:value="formData.type" placeholder="请输入反馈类型" allow-clear />
			</a-form-item>
			<a-form-item label="联系人姓名：" name="contactName">
				<a-input v-model:value="formData.contactName" placeholder="请输入联系人姓名" allow-clear />
			</a-form-item>
			<a-form-item label="联系电话：" name="contactPhone">
				<a-input v-model:value="formData.contactPhone" placeholder="请输入联系电话" allow-clear />
			</a-form-item>
			<a-form-item label="联系邮箱：" name="contactEmail">
				<a-input v-model:value="formData.contactEmail" placeholder="请输入联系邮箱" allow-clear />
			</a-form-item>
			<a-form-item label="附件URL：" name="attachmentUrl">
				<a-input v-model:value="formData.attachmentUrl" placeholder="请输入附件URL" allow-clear />
			</a-form-item>
			<a-form-item label="处理状态：PENDING-待处理，PROCESSING-处理中，RESOLVED-已解决，CLOSED-已关闭：" name="status">
				<a-select v-model:value="formData.status" placeholder="请选择处理状态：PENDING-待处理，PROCESSING-处理中，RESOLVED-已解决，CLOSED-已关闭" :options="statusOptions" />
			</a-form-item>
			<a-form-item label="优先级：LOW-低，NORMAL-中，HIGH-高，URGENT-紧急：" name="priority">
				<a-select v-model:value="formData.priority" placeholder="请选择优先级：LOW-低，NORMAL-中，HIGH-高，URGENT-紧急" :options="priorityOptions" />
			</a-form-item>
			<a-form-item label="反馈用户ID：" name="userId">
				<a-input v-model:value="formData.userId" placeholder="请输入反馈用户ID" allow-clear />
			</a-form-item>
			<a-form-item label="用户类型：VOLUNTEER-志愿者，ORGANIZER-组织者，ADMIN-管理员：" name="userType">
				<a-select v-model:value="formData.userType" placeholder="请选择用户类型：VOLUNTEER-志愿者，ORGANIZER-组织者，ADMIN-管理员" :options="userTypeOptions" />
			</a-form-item>
			<a-form-item label="分配给处理人ID：" name="assignTo">
				<a-input v-model:value="formData.assignTo" placeholder="请输入分配给处理人ID" allow-clear />
			</a-form-item>
			<a-form-item label="处理时间：" name="processTime">
				<a-date-picker v-model:value="formData.processTime" value-format="YYYY-MM-DD HH:mm:ss" show-time placeholder="请选择处理时间" style="width: 100%" />
			</a-form-item>
			<a-form-item label="解决时间：" name="resolveTime">
				<a-date-picker v-model:value="formData.resolveTime" value-format="YYYY-MM-DD HH:mm:ss" show-time placeholder="请选择解决时间" style="width: 100%" />
			</a-form-item>
			<a-form-item label="处理结果：" name="resolveResult">
				<a-textarea v-model:value="formData.resolveResult" placeholder="请输入处理结果" :auto-size="{ minRows: 3, maxRows: 5 }" />
			</a-form-item>
			<a-form-item label="满意度评分（1-5分）：" name="satisfaction">
				<a-input-number v-model:value="formData.satisfaction" placeholder="请输入满意度评分（1-5分）" :min="1" :max="10000" style="width: 100%" />
			</a-form-item>
			<a-form-item label="评价内容：" name="evaluation">
				<a-textarea v-model:value="formData.evaluation" placeholder="请输入评价内容" :auto-size="{ minRows: 3, maxRows: 5 }" />
			</a-form-item>
			<a-form-item label="排序码：" name="sortCode">
				<a-input v-model:value="formData.sortCode" placeholder="请输入排序码" allow-clear />
			</a-form-item>
			<a-form-item label="备注：" name="remark">
				<a-input v-model:value="formData.remark" placeholder="请输入备注" allow-clear />
			</a-form-item>
			<a-form-item label="扩展信息：" name="extJson">
				<a-input v-model:value="formData.extJson" placeholder="请输入扩展信息" allow-clear />
			</a-form-item>
		</a-form>
		<template #footer>
			<a-button style="margin-right: 8px" @click="onClose">关闭</a-button>
			<a-button type="primary" @click="onSubmit" :loading="submitLoading">保存</a-button>
		</template>
	</xn-form-container>
</template>

<script setup name="bizFeedbackForm">
	import tool from '@/utils/tool'
	import { cloneDeep } from 'lodash-es'
	import { required } from '@/utils/formRules'
	import bizFeedbackApi from '@/api/biz/bizFeedbackApi'
	// 抽屉状态
	const open = ref(false)
	const emit = defineEmits({ successful: null })
	const formRef = ref()
	// 表单数据
	const formData = ref({})
	const submitLoading = ref(false)
	const statusOptions = ref([])
	const priorityOptions = ref([])
	const userTypeOptions = ref([])

	// 打开抽屉
	const onOpen = (record) => {
		open.value = true
		if (record) {
			let recordData = cloneDeep(record)
			formData.value = Object.assign({}, recordData)
		}
		statusOptions.value = tool.dictList('BIZ_FEEDBACK_STATUS')
		priorityOptions.value = tool.dictList('BIZ_FEEDBACK_PRIORITY')
		userTypeOptions.value = tool.dictList('BIZ_FEEDBACK_USER_TYPE')
	}
	// 关闭抽屉
	const onClose = () => {
		formRef.value.resetFields()
		formData.value = {}
		open.value = false
	}
	// 默认要校验的
	const formRules = {
		title: [required('请输入反馈标题')],
		content: [required('请输入反馈内容')],
		type: [required('请输入反馈类型')],
		contactName: [required('请输入联系人姓名')],
		contactPhone: [required('请输入联系电话')],
	}
	// 验证并提交数据
	const onSubmit = () => {
		formRef.value
			.validate()
			.then(() => {
				submitLoading.value = true
				const formDataParam = cloneDeep(formData.value)
				bizFeedbackApi
					.bizFeedbackSubmitForm(formDataParam, formDataParam.id)
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
