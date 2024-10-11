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
                <el-form-item label="是否超级管理员 0-否 1-是" prop="root">
                    <el-input v-model="formData.root" clearable placeholder="请输入是否超级管理员 0-否 1-是" />
                </el-form-item>
                <el-form-item label="名称" prop="name">
                    <el-input v-model="formData.name" clearable placeholder="请输入名称" />
                </el-form-item>
                <el-form-item label="用户头像" prop="avatar">
                    <el-input v-model="formData.avatar" clearable placeholder="请输入用户头像" />
                </el-form-item>
                <el-form-item label="账号" prop="account">
                    <el-input v-model="formData.account" clearable placeholder="请输入账号" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="formData.password" clearable placeholder="请输入密码" />
                </el-form-item>
                <el-form-item label="最后登录时间" prop="login_time">
                    <el-input v-model="formData.login_time" clearable placeholder="请输入最后登录时间" />
                </el-form-item>
                <el-form-item label="最后登录ip" prop="login_ip">
                    <el-input v-model="formData.login_ip" clearable placeholder="请输入最后登录ip" />
                </el-form-item>
                <el-form-item label="是否支持多处登录：1-是；0-否；" prop="multipoint_login">
                    <el-input v-model="formData.multipoint_login" clearable placeholder="请输入是否支持多处登录：1-是；0-否；" />
                </el-form-item>
                <el-form-item label="是否禁用：0-否；1-是；" prop="disable">
                    <el-input v-model="formData.disable" clearable placeholder="请输入是否禁用：0-否；1-是；" />
                </el-form-item>
            </el-form>
        </popup>
    </div>
</template>

<script lang="ts" setup name="adminEdit">
import type { FormInstance } from 'element-plus'
import Popup from '@/components/popup/index.vue'
import { apiAdminAdd, apiAdminEdit, apiAdminDetail } from '@/api/admin'
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
    return mode.value == 'edit' ? '编辑管理员表' : '新增管理员表'
})

// 表单数据
const formData = reactive({
    id: '',
    root: '',
    name: '',
    avatar: '',
    account: '',
    password: '',
    login_time: '',
    login_ip: '',
    multipoint_login: '',
    disable: '',
})


// 表单验证
const formRules = reactive<any>({
    root: [{
        required: true,
        message: '请输入是否超级管理员 0-否 1-是',
        trigger: ['blur']
    }],
    name: [{
        required: true,
        message: '请输入名称',
        trigger: ['blur']
    }],
    avatar: [{
        required: true,
        message: '请输入用户头像',
        trigger: ['blur']
    }],
    account: [{
        required: true,
        message: '请输入账号',
        trigger: ['blur']
    }],
    password: [{
        required: true,
        message: '请输入密码',
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
    const data = await apiAdminDetail({
        id: row.id
    })
    setFormData(data)
}


// 提交按钮
const handleSubmit = async () => {
    await formRef.value?.validate()
    const data = { ...formData,  }
    mode.value == 'edit' 
        ? await apiAdminEdit(data) 
        : await apiAdminAdd(data)
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
