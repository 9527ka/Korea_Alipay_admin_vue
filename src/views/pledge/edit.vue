<template>
    <div class="edit-popup">
        <popup ref="popupRef" :title="popupTitle" :async="true" width="550px" @confirm="handleSubmit"
            @close="handleClose">
            <el-form ref="formRef" :model="formData" label-width="90px" :rules="formRules">
                <el-form-item label="产品名称" prop="name">
                    <el-input v-model="formData.name" clearable placeholder="请输入产品名称" />
                </el-form-item>
                <el-form-item label="利率%" prop="rate">
                    <el-input v-model="formData.rate" clearable placeholder="请输入利率%" />
                </el-form-item>
                <el-form-item label="周期(天)" prop="day">
                    <el-input v-model="formData.day" clearable placeholder="请输入周期(天)" />
                </el-form-item>
                <el-form-item label="头部标签" prop="label">
                    <el-input v-model="formData.label" clearable placeholder="请输入头部标签" />
                </el-form-item>
                <el-form-item label="标签" prop="explain">
                    <el-input v-model="formData.explain" clearable placeholder="请输入标签" />
                </el-form-item>
                <!-- <el-form-item label="限额" prop="max_amount">
                    <el-input v-model="formData.max_amount" clearable placeholder="请输入限额" />
                </el-form-item> -->
            </el-form>
        </popup>
    </div>
</template>

<script lang="ts" setup name="pledgeEdit">
import type { FormInstance } from 'element-plus'
import Popup from '@/components/popup/index.vue'
import { apiPledgeAdd, apiPledgeEdit, apiPledgeDetail } from '@/api/pledge'
import { timeFormat } from '@/utils/util'
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
    return mode.value == 'edit' ? '编辑质押产品' : '新增质押产品'
})

// 表单数据
const formData = reactive({
    id: '',
    name: '',
    rate: '',
    day: '',
    label: '',
    explain: '',
    max_amount: '',
})


// 表单验证
const formRules = reactive<any>({
    name: [{
        required: true,
        message: '请输入产品名称',
        trigger: ['blur']
    }],
    rate: [{
        required: true,
        message: '请输入利率%',
        trigger: ['blur']
    }],
    day: [{
        required: true,
        message: '请输入周期(天)',
        trigger: ['blur']
    }],
    label: [{
        required: true,
        message: '请输入头部标签',
        trigger: ['blur']
    }],
    explain: [{
        required: true,
        message: '请输入标签',
        trigger: ['blur']
    }],
    max_amount: [{
        required: true,
        message: '请输入限额',
        trigger: ['blur']
    }]
})


// 获取详情
const setFormData = async (data: Record<any, any>) => {
    for (const key in formData) {
        if (data[key] != null && data[key] != undefined) {
            //@ts-ignore
            formData[key] = data[key]
        }
    }


}

const getDetail = async (row: Record<string, any>) => {
    const data = await apiPledgeDetail({
        id: row.id
    })
    setFormData(data)
}


// 提交按钮
const handleSubmit = async () => {
    await formRef.value?.validate()
    const data = { ...formData, }
    mode.value == 'edit'
        ? await apiPledgeEdit(data)
        : await apiPledgeAdd(data)
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
    setFormData,
    getDetail
})
</script>
