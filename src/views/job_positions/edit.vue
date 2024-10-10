<template>
    <div class="edit-popup">
        <popup ref="popupRef" :title="popupTitle" :async="true" width="900" @confirm="handleSubmit"
            @close="handleClose">
            <el-form ref="formRef" :model="formData" label-width="90px" :rules="formRules">
                <el-form-item label="岗位" prop="position_name">
                    <el-input v-model="formData.position_name" clearable placeholder="请输入岗位" />
                </el-form-item>
                <el-form-item label="招聘人数" prop="recruitment_number">
                    <el-input v-model="formData.recruitment_number" clearable placeholder="请输入招聘人数" />
                </el-form-item>
                <el-form-item label="工作地点" prop="work_location">
                    <el-input v-model="formData.work_location" clearable placeholder="请输入工作地点" />
                </el-form-item>
                <el-form-item label="岗位职责" prop="responsibilities">
                    <editor v-model="formData.responsibilities" :height="300" :width="750" />
                </el-form-item>
                <el-form-item label="岗位要求" prop="requirements">
                    <editor v-model="formData.requirements" :height="300" :width="750" />
                </el-form-item>
            </el-form>
        </popup>
    </div>
</template>

<script lang="ts" setup name="jobPositionsEdit">
import type { FormInstance } from 'element-plus'
import Popup from '@/components/popup/index.vue'
import { apiJobPositionsAdd, apiJobPositionsEdit, apiJobPositionsDetail } from '@/api/job_positions'
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
    return mode.value == 'edit' ? '编辑招聘管理' : '新增招聘管理'
})

// 表单数据
const formData = reactive({
    id: '',
    position_name: '',
    recruitment_number: '',
    work_location: '',
    responsibilities: '',
    requirements: '',
})


// 表单验证
const formRules = reactive<any>({
    position_name: [{
        required: true,
        message: '请输入岗位',
        trigger: ['blur']
    }],
    recruitment_number: [{
        required: true,
        message: '请输入招聘人数',
        trigger: ['blur']
    }],
    work_location: [{
        required: true,
        message: '请输入工作地点',
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
    const data = await apiJobPositionsDetail({
        id: row.id
    })
    setFormData(data)
}


// 提交按钮
const handleSubmit = async () => {
    await formRef.value?.validate()
    const data = { ...formData, }
    mode.value == 'edit'
        ? await apiJobPositionsEdit(data)
        : await apiJobPositionsAdd(data)
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
