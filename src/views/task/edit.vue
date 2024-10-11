<template>
    <div class="edit-popup">
        <popup
            ref="popupRef"
            :title="popupTitle"
            :async="true"
            width="550px"
            @confirm="handleSubmit"
            @close="handleClose"
        >
            <el-form ref="formRef" :model="formData" label-width="90px" :rules="formRules">
                <el-form-item label="标题" prop="title">
                    <el-input v-model="formData.title" clearable placeholder="请输入标题" />
                </el-form-item>
                <el-form-item label="介绍" prop="desc">
                    <el-input v-model="formData.desc" clearable placeholder="请输入介绍" />
                </el-form-item>
                <el-form-item label="需要完成的次数" prop="num">
                    <el-input v-model="formData.num" clearable placeholder="请输入需要完成的次数" />
                </el-form-item>
                <el-form-item label="奖励金额" prop="reward">
                    <el-input v-model="formData.reward" clearable placeholder="请输入奖励金额" />
                </el-form-item>
            </el-form>
        </popup>
    </div>
</template>

<script lang="ts" setup name="taskEdit">
import type { FormInstance } from 'element-plus'
import Popup from '@/components/popup/index.vue'
import { apiTaskAdd, apiTaskEdit, apiTaskDetail } from '@/api/task'
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
    return mode.value == 'edit' ? '编辑任务管理' : '新增任务管理'
})

// 表单数据
const formData = reactive({
    id: '',
    title: '',
    desc: '',
    num: '',
    reward: '',
})


// 表单验证
const formRules = reactive<any>({
    title: [{
        required: true,
        message: '请输入标题',
        trigger: ['blur']
    }],
    num: [{
        required: true,
        message: '请输入需要完成的次数',
        trigger: ['blur']
    }],
    reward: [{
        required: true,
        message: '请输入奖励金额',
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
    const data = await apiTaskDetail({
        id: row.id
    })
    setFormData(data)
}


// 提交按钮
const handleSubmit = async () => {
    await formRef.value?.validate()
    const data = { ...formData,  }
    mode.value == 'edit' 
        ? await apiTaskEdit(data) 
        : await apiTaskAdd(data)
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
