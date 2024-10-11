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
                <el-form-item label="群id" prop="list_id">
                    <el-input v-model="formData.list_id" clearable placeholder="请输入群id" />
                </el-form-item>
                <el-form-item label="群主id" prop="main_id">
                    <el-input v-model="formData.main_id" clearable placeholder="请输入群主id" />
                </el-form-item>
                <el-form-item label="群名称" prop="name">
                    <el-input v-model="formData.name" clearable placeholder="请输入群名称" />
                </el-form-item>
                <el-form-item label="红包金额" prop="limit_money">
                    <el-input v-model="formData.limit_money" clearable placeholder="请输入红包金额" />
                </el-form-item>
                <el-form-item label="红包数量" prop="limit_num">
                    <el-input v-model="formData.limit_num" clearable placeholder="请输入红包数量" />
                </el-form-item>
                <el-form-item label="用户数量" prop="user_count">
                    <el-input v-model="formData.user_count" clearable placeholder="请输入用户数量" />
                </el-form-item>
            </el-form>
        </popup>
    </div>
</template>

<script lang="ts" setup name="groupsEdit">
import type { FormInstance } from 'element-plus'
import Popup from '@/components/popup/index.vue'
import { apiGroupsAdd, apiGroupsEdit, apiGroupsDetail } from '@/api/groups'
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
    return mode.value == 'edit' ? '编辑红包群表' : '新增红包群表'
})

// 表单数据
const formData = reactive({
    id: '',
    list_id: '',
    main_id: '',
    name: '',
    limit_money: '',
    limit_num: '',
    user_count: '',
})


// 表单验证
const formRules = reactive<any>({
    list_id: [{
        required: true,
        message: '请输入群id',
        trigger: ['blur']
    }],
    main_id: [{
        required: true,
        message: '请输入群主id',
        trigger: ['blur']
    }],
    name: [{
        required: true,
        message: '请输入群名称',
        trigger: ['blur']
    }],
    limit_money: [{
        required: true,
        message: '请输入红包金额',
        trigger: ['blur']
    }],
    limit_num: [{
        required: true,
        message: '请输入红包数量',
        trigger: ['blur']
    }],
    user_count: [{
        required: true,
        message: '请输入用户数量',
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
    const data = await apiGroupsDetail({
        id: row.id
    })
    setFormData(data)
}


// 提交按钮
const handleSubmit = async () => {
    await formRef.value?.validate()
    const data = { ...formData,  }
    mode.value == 'edit' 
        ? await apiGroupsEdit(data) 
        : await apiGroupsAdd(data)
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
