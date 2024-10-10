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
                <el-form-item label="图片类型" prop="type">
                    <el-radio-group v-model="formData.type" placeholder="请选择图片类型">
                        <el-radio 
                            v-for="(item, index) in dictData.img_type"
                            :key="index"
                            :label="item.value"
                        >
                            {{ item.name }}
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="标题" prop="title">
                    <el-input v-model="formData.title" clearable placeholder="请输入标题" />
                </el-form-item>
                <el-form-item label="简介" prop="desc">
                    <el-input v-model="formData.desc" clearable placeholder="请输入简介" />
                </el-form-item>
                <el-form-item label="图片" prop="image">
                    <material-picker v-model="formData.image" />
                </el-form-item>
                <el-form-item label="按钮链接" prop="btn_link">
                    <el-input v-model="formData.btn_link" clearable placeholder="请输入按钮链接" />
                </el-form-item>
            </el-form>
        </popup>
    </div>
</template>

<script lang="ts" setup name="bannerEdit">
import type { FormInstance } from 'element-plus'
import Popup from '@/components/popup/index.vue'
import { apiBannerAdd, apiBannerEdit, apiBannerDetail } from '@/api/banner'
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
    return mode.value == 'edit' ? '编辑Banner管理' : '新增Banner管理'
})

// 表单数据
const formData = reactive({
    id: '',
    type: '',
    title: '',
    desc: '',
    image: '',
    btn_link: '',
})


// 表单验证
const formRules = reactive<any>({
    type: [{
        required: true,
        message: '请选择图片类型',
        trigger: ['blur']
    }],
    title: [{
        required: true,
        message: '请输入标题',
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
    const data = await apiBannerDetail({
        id: row.id
    })
    setFormData(data)
}


// 提交按钮
const handleSubmit = async () => {
    await formRef.value?.validate()
    const data = { ...formData,  }
    mode.value == 'edit' 
        ? await apiBannerEdit(data) 
        : await apiBannerAdd(data)
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
