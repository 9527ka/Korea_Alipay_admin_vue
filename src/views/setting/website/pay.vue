<!-- 网站信息 -->

<template>
    <div class="website-information">
        <el-form ref="formRef" :rules="rules" class="ls-form" :model="formData" label-width="120px" scroll-to-error>
            <el-card shadow="never" class="!border-none">
                <div class="text-xl font-medium mb-[20px]">充值信息设置</div>
                <el-form-item label="TRC20地址" prop="trc20">
                    <div class="w-80">
                        <el-input v-model.trim="formData.trc20" placeholder="请输入TRC20地址" maxlength="200"
                            show-word-limit />
                        <div class="form-tips">充值到官方的TRC20地址</div>
                    </div>
                </el-form-item>
                <el-form-item label="银行卡号" prop="bank">
                    <div class="w-80">
                        <el-input v-model.trim="formData.bank" placeholder="请输入银行卡号" maxlength="200" show-word-limit />
                        <div class="form-tips">充值到官方的银行卡号</div>
                    </div>
                </el-form-item>
                <el-form-item label="汇率" prop="rate">
                    <div class="w-80">
                        <el-input v-model.trim="formData.rate" placeholder="请输入汇率" maxlength="200" show-word-limit />
                        <div class="form-tips">请输入1美元兑换韩元的汇率，如：₩ 1356.65</div>
                    </div>
                </el-form-item>
            </el-card>
        </el-form>
        <footer-btns v-perms="['setting.web.web_setting/setConfigPay']">
            <el-button type="primary" @click="handleSubmit">保存</el-button>
        </footer-btns>
    </div>
</template>

<script lang="ts" setup name="webInformation">
import type { FormInstance } from 'element-plus'

import { getConfigPay, setConfigPay } from '@/api/setting/website'
import useAppStore from '@/stores/modules/app'

const formRef = ref<FormInstance>()

const appStore = useAppStore()
// 表单数据
const formData = reactive({
    trc20: '',
    bank: '',
    rate: '',
})

// 表单验证
const rules = {
    name: [
        {
            required: true,
            message: '请输入TRC20地址',
            trigger: ['blur']
        }
    ],
    bank: [
        {
            required: true,
            message: '请选择银行卡号',
            trigger: ['change']
        }
    ],
    rate: [
        {
            required: true,
            message: '请填写汇率',
            trigger: ['change']
        }
    ]
}

// 获取
const getData = async () => {
    const data = await getConfigPay()
    for (const key in formData) {
        //@ts-ignore
        formData[key] = data[key]
    }
}

// 设置
const handleSubmit = async () => {
    await formRef.value?.validate()
    await setConfigPay(formData)
    appStore.getConfig()
    getData()
}

getData()
</script>

<style lang="scss" scoped></style>
