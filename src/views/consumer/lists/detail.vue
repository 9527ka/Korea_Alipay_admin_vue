<template>
    <div>
        <el-card class="!border-none" shadow="never">
            <el-page-header content="用户详情" @back="$router.back()" />
            <el-button @click="setAgent()">代理绑定</el-button>
        </el-card>
        <el-card class="mt-4 !border-none" header="基本资料" shadow="never">
            <el-form ref="formRef" class="bg-page ls-form flex" :model="formData" label-width="120px">
                <div class="flex py-5 mb-10 items-center">
                    <!-- <div class="basis-40 flex flex-col justify-center items-center">
                        <div class="mb-2 text-tx-regular">用户头像</div>
                        <el-avatar :src="formData.avatar" :size="58" />
                    </div> -->
                    <div class="basis-40 flex flex-col justify-center items-center">
                        <div class="text-tx-regular">账户余额</div>
                        <div class="mt-2 flex items-center" style="margin-left:40px;">
                            ₩{{ formData.user_money }}
                            <el-button v-perms="['user.user/adjustMoney']" type="primary" link
                                @click="handleAdjust(formData.user_money)">
                                调整
                            </el-button>
                        </div>
                    </div>
                </div>
                <!-- <el-form-item label="用户昵称：">
                    {{ formData.nickname }}
                </el-form-item> -->
                <el-form-item label="账号：">
                    {{ formData.account }}
                    <popover-input class="ml-[10px]" @confirm="handleEdit($event, 'account')" :limit="32"
                        v-perms="['user.user/edit']">
                        <el-button type="primary" link>
                            <icon name="el-icon-EditPen" />
                        </el-button>
                    </popover-input>
                </el-form-item>
                <el-form-item label="手机号：">
                    {{ formData.mobile || '-' }}
                    <popover-input class="ml-[10px]" type="number" @confirm="handleEdit($event, 'mobile')"
                        v-perms="['user.user/edit']">
                        <el-button type="primary" link>
                            <icon name="el-icon-EditPen" />
                        </el-button>
                    </popover-input>
                </el-form-item>
                <el-form-item label="密码：">
                    ******
                    <popover-input class="ml-[10px]" @confirm="handleEdit($event, 'password')" :limit="32"
                        v-perms="['user.user/edit']">
                        <el-button type="primary" link>
                            <icon name="el-icon-EditPen" />
                        </el-button>
                    </popover-input>
                </el-form-item>
                <!-- <el-form-item label="注册来源："> {{ formData.channel }} </el-form-item> -->
                <!-- <el-form-item label="注册时间："> {{ formData.create_time }} </el-form-item> -->
                <!-- <el-form-item label="最近登录时间："> {{ formData.login_time }} </el-form-item> -->
            </el-form>
            <el-card class="mt-4 !border-none" header="上级用户" shadow="never">
                <div v-if="formData.parent" class="flex parent">
                    <div>账号<br>{{ formData.parent.account }}</div>
                    <div>手机号<br>{{ formData.parent.mobile }}</div>
                    <div>总充值<br>{{ formData.parent_order_total }}</div>
                </div>
            </el-card>
            <el-card class="mt-4 !border-none" header="下级用户" shadow="never">
                <div v-if="formData.child" class="flex parent">
                    <div>账号<br>{{ formData.child.account }}</div>
                    <div>手机号<br>{{ formData.child.mobile }}</div>
                    <div>总充值<br>{{ formData.child_order_total }}</div>
                </div>
            </el-card>
        </el-card>
        <account-adjust v-model:show="adjustState.show" :value="adjustState.value" @confirm="handleConfirmAdjust" />
        <set-agent v-if="showAgent" ref="editRef" @success="getDetails" @close="showAgent = false" />
    </div>
</template>

<style>
.parent div {
    width: 120px;
}
</style>

<script lang="ts" setup name="consumerDetail">
import type { FormInstance } from 'element-plus'

import { adjustMoney, getUserDetail, userEdit } from '@/api/consumer'
import { isEmpty } from '@/utils/util'
import SetAgent from './set_agent.vue'
const editRef = shallowRef<InstanceType<typeof SetAgent>>()
import AccountAdjust from '../components/account-adjust.vue'
import { format } from 'echarts';
const showAgent = ref(false)
const route = useRoute()
const formData = reactive({
    avatar: '',
    channel: '',
    create_time: '',
    login_time: '',
    mobile: '',
    nickname: '',
    real_name: 0,
    sex: 0,
    sn: '',
    account: '',
    user_money: '',
    parent: '',
    child: '',
    parent_order_total: 0,
    child_order_total: 0
})

const adjustState = reactive({
    show: false,
    value: ''
})
const formRef = shallowRef<FormInstance>()

const setAgent = async (data: any) => {
    showEdit.value = true
    await nextTick()
    editRef.value?.open('edit')
    editRef.value?.setFormData(data)
}

const getDetails = async () => {
    const data = await getUserDetail({
        id: route.query.id
    })
    Object.keys(formData).forEach((key) => {
        //@ts-ignore
        formData[key] = data[key]
    })
}

const handleEdit = async (value: string, field: string) => {
    if (isEmpty(value)) return
    await userEdit({
        id: route.query.id,
        field,
        value
    })
    getDetails()
}

const handleAdjust = (value: string) => {
    adjustState.show = true
    adjustState.value = value
}
const handleConfirmAdjust = async (value: any) => {
    await adjustMoney({ user_id: route.query.id, ...value })
    adjustState.show = false
    getDetails()
}
getDetails()
</script>
