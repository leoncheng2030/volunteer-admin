<template>
	<xn-form-container
		:title="formData.id ? '编辑志愿活动' : '增加志愿活动'"
		:width="1000"
		v-model:open="open"
		:destroy-on-close="true"
		@close="onClose"
	>
		<a-steps :current="currentStep" class="mb-6">
			<a-step title="基本信息" description="填写活动的基本信息" />
			<a-step title="活动详情" description="编辑活动的详细内容" />
		</a-steps>

		<a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
			<!-- 第一步：基本信息 -->
			<div v-show="currentStep === 0">
				<a-row :gutter="16">
					<a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
						<a-form-item label="活动封面:" name="coverImage">
							<xn-upload v-model:value="formData.coverImage" uploadMode="image" />
						</a-form-item>
					</a-col>
					<a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
						<a-form-item label="活动标题：" name="title">
							<a-input v-model:value="formData.title" placeholder="请输入活动标题" allow-clear />
						</a-form-item>
					</a-col>
					<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
						<a-form-item label="报名截止时间：" name="signupDeadline">
							<a-date-picker v-model:value="formData.signupDeadline" value-format="YYYY-MM-DD HH:mm:ss" show-time placeholder="请选择报名截止时间" style="width: 100%" />
						</a-form-item>
					</a-col>
					<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
						<a-form-item label="活动日期：" name="activityDate">
							<a-date-picker v-model:value="formData.activityDate" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择活动日期" style="width: 100%" />
						</a-form-item>
					</a-col>
					<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
						<a-form-item label="开始时间：" name="startTime">
							<a-time-picker v-model:value="formData.startTime" value-format="HH:mm:ss" placeholder="请选择开始时间" style="width: 100%" />
						</a-form-item>
					</a-col>
					<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
						<a-form-item label="结束时间：" name="endTime">
							<a-time-picker v-model:value="formData.endTime" value-format="HH:mm:ss" placeholder="请选择结束时间" style="width: 100%" />
						</a-form-item>
					</a-col>
					<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
						<a-form-item label="活动地点：" name="location">
							<a-input v-model:value="formData.location" placeholder="请输入活动地点" allow-clear />
						</a-form-item>
					</a-col>
					<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
						<a-form-item label="招募人数：" name="recruitCount">
							<a-input-number v-model:value="formData.recruitCount" :min="1" :max="10000" style="width: 100%" />
						</a-form-item>
					</a-col>
					<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
						<a-form-item label="已报名人数：" name="signedCount">
							<a-input v-model:value="formData.signedCount" placeholder="请输入已报名人数" allow-clear />
						</a-form-item>
					</a-col>
					<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
						<a-form-item label="服务时长（小时）：" name="serviceHours">
							<a-input v-model:value="formData.serviceHours" placeholder="请输入服务时长（小时）" allow-clear />
						</a-form-item>
					</a-col>
					<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
						<a-form-item label="活动积分：" name="activityPoints" :tooltip="'用户完成该活动后可获得的积分'">
							<a-input-number v-model:value="formData.activityPoints" :min="0" :max="10000" style="width: 100%" placeholder="请输入活动积分" />
						</a-form-item>
					</a-col>
					<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
						<a-form-item label="联系人：" name="contactPerson">
							<a-input v-model:value="formData.contactPerson" placeholder="请输入联系人" allow-clear />
						</a-form-item>
					</a-col>
					<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
						<a-form-item label="联系电话：" name="contactPhone">
							<a-input v-model:value="formData.contactPhone" placeholder="请输入联系电话" allow-clear />
						</a-form-item>
					</a-col>
					<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
						<a-form-item label="是否允许重复报名：" name="allowResignup" :tooltip="'开启后，用户取消报名后可以重新报名同一活动'">
							<a-switch
								v-model:checked="formData.allowResignup"
								:checked-children="'是'"
								:un-checked-children="'否'"
							/>
						</a-form-item>
					</a-col>
					<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
						<a-form-item label="同行人数占用名额：" name="peerCountOccupiesQuota" :tooltip="'开启后，用户报名时填写的同行人数会占用活动的招募名额'">
							<a-switch
								v-model:checked="formData.peerCountOccupiesQuota"
								:checked-children="'是'"
								:un-checked-children="'否'"
							/>
						</a-form-item>
					</a-col>
					<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
						<a-form-item label="排序码：" name="sortCode">
							<a-input v-model:value="formData.sortCode" placeholder="请输入排序码" allow-clear />
						</a-form-item>
					</a-col>
					<a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
						<a-form-item label="备注：" name="remark">
							<a-input v-model:value="formData.remark" placeholder="请输入备注" allow-clear />
						</a-form-item>
					</a-col>
				</a-row>
			</div>

			<!-- 第二步：活动详情 -->
			<div v-show="currentStep === 1">
				<a-row :gutter="16">
					<a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
						<a-form-item label="活动详情内容（富文本）：" name="content">
							<xn-editor 
								v-model:value="formData.content" 
								placeholder="请输入活动详情内容（富文本）" 
								height="900px"
							/>
						</a-form-item>
					</a-col>
				</a-row>
			</div>
		</a-form>

		<template #footer>
			<a-button style="margin-right: 8px" @click="onClose">关闭</a-button>
			<a-button v-if="currentStep > 0" style="margin-right: 8px" @click="prevStep">上一步</a-button>
			<a-button v-if="currentStep < 1" type="primary" @click="nextStep" :loading="submitLoading">下一步</a-button>
			<a-button v-if="currentStep === 1" type="primary" @click="onSubmit" :loading="submitLoading">保存</a-button>
		</template>
	</xn-form-container>
</template>

<script setup name="volActivityForm">
	import tool from '@/utils/tool'
	import { cloneDeep } from 'lodash-es'
	import { required } from '@/utils/formRules'
	import volActivityApi from '@/api/biz/volActivityApi'
	// 抽屉状态
	const open = ref(false)
	const emit = defineEmits({ successful: null })
	const formRef = ref()
	// 表单数据
	const formData = ref({})
	const submitLoading = ref(false)
	const statusOptions = ref([])
	const currentStep = ref(0)

	// 打开抽屉
	const onOpen = (record) => {
		open.value = true
		if (record) {
			let recordData = cloneDeep(record)
			
			// 处理日期时间格式
			if (recordData.activityDate) {
				const activityDate = new Date(recordData.activityDate)
				recordData.activityDate = activityDate.toISOString().split('T')[0] + ' 00:00:00'
			}
			if (recordData.startTime) {
				// 如果后端返回的是Time类型，直接使用或格式化为HH:mm:ss
				if (typeof recordData.startTime === 'string') {
					// 如果已经是字符串格式，确保是HH:mm:ss格式
					if (recordData.startTime.length === 5) {
						recordData.startTime = recordData.startTime + ':00'
					}
				} else {
					// 如果是Date对象，提取时间部分
					const startTime = new Date(recordData.startTime)
					const timeStr = startTime.toTimeString().substring(0, 8)
					recordData.startTime = timeStr
				}
			}
			if (recordData.endTime) {
				// 如果后端返回的是Time类型，直接使用或格式化为HH:mm:ss
				if (typeof recordData.endTime === 'string') {
					// 如果已经是字符串格式，确保是HH:mm:ss格式
					if (recordData.endTime.length === 5) {
						recordData.endTime = recordData.endTime + ':00'
					}
				} else {
					// 如果是Date对象，提取时间部分
					const endTime = new Date(recordData.endTime)
					const timeStr = endTime.toTimeString().substring(0, 8)
					recordData.endTime = timeStr
				}
			}
			if (recordData.signupDeadline) {
				const signupDeadline = new Date(recordData.signupDeadline)
				recordData.signupDeadline = signupDeadline.toISOString().replace('T', ' ').substring(0, 19)
			}
			
			formData.value = Object.assign({}, recordData)
			// 解析扩展信息中的配置
			if (recordData.extJson) {
				try {
					const extInfo = JSON.parse(recordData.extJson)
					formData.value.allowResignup = extInfo.allowResignup || false
					formData.value.peerCountOccupiesQuota = extInfo.peerCountOccupiesQuota !== false // 默认为true
					formData.value.activityPoints = extInfo.activityPoints || 0 // 活动积分
				} catch (e) {
					formData.value.allowResignup = false
					formData.value.peerCountOccupiesQuota = true
					formData.value.activityPoints = 0
				}
			} else {
				formData.value.allowResignup = false
				formData.value.peerCountOccupiesQuota = true
				formData.value.activityPoints = 0
			}
		} else {
			// 新增时默认值
			formData.value.allowResignup = false
			formData.value.peerCountOccupiesQuota = true
			formData.value.activityPoints = 0
		}
		statusOptions.value = tool.dictList('VOL_ACTIVITY_STATUS')
	}
	// 关闭抽屉
	const onClose = () => {
		formRef.value.resetFields()
		formData.value = {}
		currentStep.value = 0
		open.value = false
	}

	// 下一步
	const nextStep = () => {
		// 验证第一步的字段
		const step1Fields = ['title', 'coverImage', 'activityDate', 'startTime', 'endTime', 'location', 'recruitCount', 'serviceHours', 'signupDeadline', 'contactPerson', 'contactPhone', 'status']
		formRef.value.validateFields(step1Fields).then(() => {
			currentStep.value = 1
		}).catch(() => {
			// 验证失败，停留在当前步骤
		})
	}

	// 上一步
	const prevStep = () => {
		currentStep.value = 0
	}
	// 默认要校验的
	const formRules = {
		title: [required('请输入活动标题')],
		coverImage: [required('请输入封面图片URL')],
		content: [required('请输入活动详情内容（富文本）')],
		activityDate: [required('请输入活动日期')],
		startTime: [required('请输入开始时间')],
		endTime: [required('请输入结束时间')],
		location: [required('请输入活动地点')],
		recruitCount: [required('请输入招募人数')],
		serviceHours: [required('请输入服务时长（小时）')],
		signupDeadline: [required('请输入报名截止时间')],
		contactPerson: [required('请输入联系人')],
		contactPhone: [required('请输入联系电话')],
		status: [required('请输入活动状态')],
	}
	// 验证并提交数据
	const onSubmit = () => {
		formRef.value
			.validate()
			.then(() => {
				submitLoading.value = true
				const formDataParam = cloneDeep(formData.value)
				
				// 构建扩展信息
				const extInfo = {}
				if (formDataParam.allowResignup !== undefined) {
					extInfo.allowResignup = formDataParam.allowResignup
				}
				if (formDataParam.peerCountOccupiesQuota !== undefined) {
					extInfo.peerCountOccupiesQuota = formDataParam.peerCountOccupiesQuota
				}
				if (formDataParam.activityPoints !== undefined) {
					extInfo.activityPoints = formDataParam.activityPoints
				}
				
				// 如果有扩展信息，将其转换为JSON字符串
				if (Object.keys(extInfo).length > 0) {
					formDataParam.extJson = JSON.stringify(extInfo)
				}
				
				// 删除临时字段，避免提交到后端
				delete formDataParam.allowResignup
				delete formDataParam.peerCountOccupiesQuota
				delete formDataParam.activityPoints
				
				volActivityApi
					.volActivitySubmitForm(formDataParam, formDataParam.id)
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
