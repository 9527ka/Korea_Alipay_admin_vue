<template>
    <div>
        <el-card class="!border-none" shadow="never">
            <el-alert type="warning" title="温馨提示：用户充值记录" :closable="false" show-icon></el-alert>
            <el-form ref="formRef" class="mb-[-16px] mt-[16px]" :model="queryParams" :inline="true">
                <el-form-item class="w-[280px]" label="充值单号">
                    <el-input v-model="queryParams.sn" placeholder="请输入充值单号" clearable @keyup.enter="resetPage" />
                </el-form-item>
                <el-form-item class="w-[280px]" label="用户信息">
                    <el-input v-model="queryParams.user_info" placeholder="请输入用户账号/手机号" clearable
                        @keyup.enter="resetPage" />
                </el-form-item>
                <el-form-item class="w-[280px]" label="支付方式">
                    <el-select v-model="queryParams.pay_way">
                        <el-option label="全部" value />
                        <el-option label="TRC20" :value="1" />
                        <el-option label="BANK" :value="2" />
                    </el-select>
                </el-form-item>
                <el-form-item class="w-[280px]" label="支付状态">
                    <el-select v-model="queryParams.pay_status">
                        <el-option label="全部" value />
                        <el-option label="未支付" :value="0" />
                        <el-option label="已支付" :value="1" />
                    </el-select>
                </el-form-item>
                <el-form-item label="下单时间">
                    <daterange-picker v-model:startTime="queryParams.start_time"
                        v-model:endTime="queryParams.end_time" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="resetPage">查询</el-button>
                    <el-button @click="resetParams">重置</el-button>
                    <!-- <export-data class="ml-2.5" :fetch-fun="rechargeLists" :params="queryParams"
                        :page-size="pager.size" /> -->
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="!border-none mt-4" shadow="never">
            <el-table size="large" v-loading="pager.loading" :data="pager.lists">
                <el-table-column label="账号" min-width="160" prop="account" />
                <el-table-column label="充值单号" prop="sn" min-width="190" />
                <el-table-column label="充值金额" min-width="100">

                    <template #default="{ row }">
                        ₩ {{ row.order_amount }} <br>
                        $&nbsp;&nbsp;{{ row.usdt }}
                    </template>
                </el-table-column>
                <el-table-column label="支付方式" prop="pay_way_text" min-width="100" />
                <el-table-column label="支付凭证" prop="pay_img">

                    <template #default="{ row }">
                        <el-image :src="row.pay_img" :preview-src-list="[row.pay_img]" class="image"
                            style="width: 50px;margin-right: 10px" />
                    </template>
                </el-table-column>
                <el-table-column label="支付时间" prop="create_time" min-width="180" />
                <el-table-column label="操作" width="120" fixed="right">

                    <template #default="{ row }">
                        <el-button v-if="row.pay_status == 0" v-perms="['ocean_card_order/check']" type="primary" link
                            :disabled="row.pay_status == 1"
                            @click="handleCheckPass(row.id, 1, row.user_id, row.order_amount)">
                            通过
                        </el-button>
                        <el-button v-if="row.pay_status == 0" v-perms="['ocean_card_order/check']" type="primary" link
                            :disabled="row.pay_status == 1" @click="handleCheck(row.id)">
                            拒绝
                        </el-button>
                        <span v-if="row.pay_status == 1" style="color:#1c990b;">审核通过</span>
                        <span v-if="row.pay_status == 2" style="color:#b11d0c;">审核拒绝<br>({{ row.remark }})</span>
                    </template>
                </el-table-column>
            </el-table>
            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>
        <check-popup v-if="showCheck" ref="checkRef" @success="getLists" @close="showCheck = false" />
    </div>
</template>

<style>
.el-table .el-table__cell {
    z-index: unset;
}

.copy-btn {
    position: absolute;
    right: 10px;
    bottom: 40%;
    cursor: pointer;
}
</style>

<script lang="ts" setup name="rechargeRecord">
import { rechargeLists, apiRechargeOrderCheck, refund } from '@/api/finance'
import { usePaging } from '@/hooks/usePaging'
import feedback from '@/utils/feedback'
import CheckPopup from './r_check.vue'
const checkRef = shallowRef<InstanceType<typeof CheckPopup>>()

// 是否显示编辑框
const showCheck = ref(false)
const queryParams = reactive({
    sn: '',
    user_info: '',
    pay_way: '',
    pay_status: '',
    start_time: '',
    end_time: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: rechargeLists,
    params: queryParams
})

// 拒绝审核
const handleCheck = async (id: any) => {
    showCheck.value = true
    await nextTick()
    checkRef.value?.open('check')
    checkRef.value?.setFormData(id)
}

const handleCheckPass = async (id: number | any[], pay_status: number | any[], user_id: number | any[], order_amount: number | any[]) => {
    await feedback.confirm('确定通过审核？')
    await apiRechargeOrderCheck({ id, pay_status, user_id, order_amount })
    getLists()
}

getLists()
</script>
