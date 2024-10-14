<template>
    <div class="check-popup">
        <popup ref="popupRef" :title="popupTitle" :async="true" width="40%" @confirm="handleSubmit"
            @close="handleClose">
            <el-form ref="formRef" :model="formData" label-width="90px" :rules="formRules">
                <el-form-item label="拒绝理由" prop="remark">
                    <el-input v-model="formData.remark" clearable placeholder="请输入拒绝理由" />
                </el-form-item>
            </el-form>
        </popup>
    </div>
</template>

<script lang="ts" setup name="oceanCardOrderCheck">
import type { FormInstance } from 'element-plus'
import Popup from '@/components/popup/index.vue'
import { apiWithdrawalOrderCheck } from '@/api/finance'
import type { PropType } from 'vue'
defineProps({
    dictData: {
        type: Object as PropType<Record<string, any[]>>,
        default: () => ({})
    }
})
const emit = defineEmits(['success', 'close'])
const formRef = shallowRef<FormInstance>()
const popupRef = shallowRef<InstanceType<typeof Popup>>()
const mode = ref('add')

// 弹窗标题
const popupTitle = computed(() => {
    return '审核'
})

// 表单数据
const formData = reactive({
    remark: '',
    order_amount: 0,
    refund_status: 2,
    user_id: 0,
    id: ''
})

// 表单验证
const formRules = reactive<any>({
    title: [{
        required: true,
        message: '请输入拒绝理由',
        trigger: ['blur']
    }],
})

// 获取详情
const setFormData = async (id: any, order_amount: any, user_id: any) => {
    formData['id'] = id
    formData['order_amount'] = order_amount
    formData['user_id'] = user_id
}

// 提交按钮
const handleSubmit = async () => {
    await formRef.value?.validate()
    const data = { ...formData, }
    await apiWithdrawalOrderCheck(data)
    popupRef.value?.close()
    emit('success')
}

//打开弹窗
const open = (type = 'add') => {
    mode.value = type
    popupRef.value?.open()
}

// 关闭回调
const handleClose = () => {
    emit('close')
}
defineExpose({
    open,
    setFormData
})
</script>
