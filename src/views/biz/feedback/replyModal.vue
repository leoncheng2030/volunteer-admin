<template>
	<a-modal
		v-model:open="visible"
		title="回复反馈"
		:width="600"
		:destroy-on-close="true"
		@ok="handleSubmit"
		@cancel="handleCancel"
		:confirmLoading="submitLoading"
	>
		<a-form ref="formRef" :model="formData" :rules="formRules" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
			<!-- 反馈信息展示 -->
			<a-divider orientation="left">反馈信息</a-divider>
			<a-descriptions :column="1" bordered size="small">
				<a-descriptions-item label="反馈标题">{{ feedbackInfo.title }}</a-descriptions-item>
				<a-descriptions-item label="反馈内容">{{ feedbackInfo.content }}</a-descriptions-item>
				<a-descriptions-item label="反馈类型">
					{{ $TOOL.dictTypeData('BIZ_FEEDBACK_TYPE', feedbackInfo.type) }}
				</a-descriptions-item>
				<a-descriptions-item label="联系方式">
					{{ feedbackInfo.contactPhone || feedbackInfo.contactEmail || '-' }}
				</a-descriptions-item>
				<a-descriptions-item label="当前状态">
					<a-tag :color="getStatusColor(feedbackInfo.status)">
						{{ $TOOL.dictTypeData('BIZ_FEEDBACK_STATUS', feedbackInfo.status) }}
					</a-tag>
				</a-descriptions-item>
			</a-descriptions>

			<!-- 回复内容 -->
			<a-divider orientation="left">回复内容</a-divider>
			<a-form-item label="回复内容" name="content">
				<a-textarea
					v-model:value="formData.content"
					placeholder="请输入回复内容，将发送给反馈用户"
					:rows="4"
					:maxlength="500"
					show-count
				/>
			</a-form-item>

			<a-form-item label="回复类型" name="replyType">
				<a-radio-group v-model:value="formData.replyType">
					<a-radio value="REPLY">正式回复</a-radio>
					<a-radio value="NOTE">内部备注</a-radio>
				</a-radio-group>
				<div style="color: #999; font-size: 12px; margin-top: 4px">
					正式回复：用户可见；内部备注：仅管理员可见
				</div>
			</a-form-item>

			<a-form-item label="是否解决" name="resolved">
				<a-switch v-model:checked="formData.resolved" />
				<div style="color: #999; font-size: 12px; margin-top: 4px">
					开启后将自动更新反馈状态为"已解决"
				</div>
			</a-form-item>
		</a-form>
	</a-modal>
</template>

<script setup name="feedbackReplyModal">
	import { ref, reactive } from 'vue'
	import { message } from 'ant-design-vue'
	import { cloneDeep } from 'lodash-es'
	import bizFeedbackReplyApi from '@/api/biz/bizFeedbackReplyApi'
	import bizFeedbackApi from '@/api/biz/bizFeedbackApi'

	const visible = ref(false)
	const submitLoading = ref(false)
	const formRef = ref()
	const emit = defineEmits(['successful'])

	// 反馈信息
	const feedbackInfo = ref({})

	// 表单数据
	const formData = ref({
		feedbackId: '',
		content: '',
		replyType: 'REPLY', // REPLY-回复，NOTE-备注
		resolved: false // 是否标记为已解决
	})

	// 表单验证规则
	const formRules = {
		content: [{ required: true, message: '请输入回复内容', trigger: 'blur' }],
		replyType: [{ required: true, message: '请选择回复类型', trigger: 'change' }]
	}

	// 打开弹窗
	const onOpen = (record) => {
		feedbackInfo.value = cloneDeep(record)
		formData.value = {
			feedbackId: record.id,
			content: '',
			replyType: 'REPLY',
			resolved: false
		}
		visible.value = true
	}

	// 关闭弹窗
	const handleCancel = () => {
		formRef.value.resetFields()
		visible.value = false
		feedbackInfo.value = {}
	}

	// 提交回复
	const handleSubmit = () => {
		formRef.value.validate().then(async () => {
			submitLoading.value = true
			try {
				// 1. 提交回复
				const replyParam = {
					feedbackId: formData.value.feedbackId,
					content: formData.value.content,
					replyType: formData.value.replyType,
					isInternal: formData.value.replyType === 'NOTE' ? 1 : 0
				}
				await bizFeedbackReplyApi.bizFeedbackReplySubmitForm(replyParam)

				// 2. 如果标记为已解决，更新反馈状态
				if (formData.value.resolved) {
					// 格式化为 yyyy-MM-dd HH:mm:ss
					const now = new Date()
					const year = now.getFullYear()
					const month = String(now.getMonth() + 1).padStart(2, '0')
					const day = String(now.getDate()).padStart(2, '0')
					const hours = String(now.getHours()).padStart(2, '0')
					const minutes = String(now.getMinutes()).padStart(2, '0')
					const seconds = String(now.getSeconds()).padStart(2, '0')
					const resolveTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
					
					// 基于原始反馈信息，只更新状态和解决相关字段
					const updateParam = {
						...feedbackInfo.value, // 保留原始数据
						status: 'RESOLVED',
						resolveTime: resolveTime,
						resolveResult: formData.value.content
					}
					await bizFeedbackApi.bizFeedbackSubmitForm(updateParam, true)
				}

				message.success('回复成功')
				handleCancel()
				emit('successful')
			} catch (error) {
				console.error('回复失败:', error)
				message.error('回复失败，请重试')
			} finally {
				submitLoading.value = false
			}
		})
	}

	// 获取状态颜色
	const getStatusColor = (status) => {
		const colorMap = {
			PENDING: 'orange',
			PROCESSING: 'blue',
			RESOLVED: 'green',
			CLOSED: 'default'
		}
		return colorMap[status] || 'default'
	}

	// 暴露方法
	defineExpose({
		onOpen
	})
</script>

<style scoped>
	:deep(.ant-descriptions-item-label) {
		font-weight: 500;
		background-color: #fafafa;
	}
</style>
