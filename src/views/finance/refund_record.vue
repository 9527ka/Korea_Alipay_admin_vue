<template>
    <div>
        <el-card class="!border-none mb-4" shadow="never">
            <div class="flex flex-wrap">
                <div class="w-1/2 md:w-1/4">
                    <div class="leading-10">累计提现金额 (₩)</div>
                    <div class="text-6xl">{{ refundData.total }}</div>
                </div>
                <div class="w-1/2 md:w-1/4">
                    <div class="leading-10">提现中金额 (₩)</div>
                    <div class="text-6xl">{{ refundData.ing }}</div>
                </div>
                <div class="w-1/2 md:w-1/4">
                    <div class="leading-10">提现成功金额 (₩)</div>
                    <div class="text-6xl">{{ refundData.success }}</div>
                </div>
                <div class="w-1/2 md:w-1/4">
                    <div class="leading-10">提现失败金额 (₩)</div>
                    <div class="text-6xl">{{ refundData.error }}</div>
                </div>
            </div>
        </el-card>
        <el-card class="!border-none" shadow="never">
            <el-form ref="formRef" class="mb-[-16px] mt-[16px]" :model="queryParams" :inline="true">
                <el-form-item class="w-[280px]" label="提现单号">
                    <el-input v-model="queryParams.sn" placeholder="请输入提现单号" clearable @keyup.enter="resetPage" />
                </el-form-item>
                <el-form-item class="w-[280px]" label="用户信息">
                    <el-input v-model="queryParams.user_info" placeholder="请输入用户信息" clearable
                        @keyup.enter="resetPage" />
                </el-form-item>
                <el-form-item class="w-[280px]" label="提现类型">
                    <el-select v-model="queryParams.refund_type">
                        <el-option label="全部" value />
                        <el-option label="TRC20" :value="1" />
                        <el-option label="BANK" :value="2" />
                    </el-select>
                </el-form-item>
                <el-form-item label="记录时间">
                    <daterange-picker v-model:startTime="queryParams.start_time"
                        v-model:endTime="queryParams.end_time" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="resetPage">查询</el-button>
                    <el-button @click="resetParams">重置</el-button>
                    <!-- <export-data
                        class="ml-2.5"
                        :fetch-fun="refundRecord"
                        :params="queryParams"
                        :page-size="pager.size"
                    /> -->
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="!border-none mt-4" shadow="never">
            <el-tabs v-model="activeTab" @tab-change="handleTabChange">
                <el-tab-pane v-for="(item, index) in tabLists"
                    :label="`${item.name}(${pager.extend[item.numKey] ?? 0})`" :name="index" :key="index">
                    <el-table size="large" v-loading="pager.loading" :data="pager.lists">
                        <el-table-column label="提现单号" prop="sn" min-width="190" />
                        <el-table-column label="账号" min-width="160" prop="account" />
                        <!-- <el-table-column label="来源单号" prop="order_sn" min-width="190" /> -->
                        <el-table-column label="提现金额" min-width="100">

                            <template #default="{ row }">
                                ₩ {{ row.order_amount }} <br>
                                $&nbsp;&nbsp;{{ row.usdt }}
                            </template>
                        </el-table-column>

                        <el-table-column label="提现类型" prop="refund_type_text" min-width="100" />
                        <el-table-column label="地址/卡号" prop="address" min-width="180" />
                        <el-table-column label="记录时间" prop="create_time" min-width="180" />
                        <el-table-column label="操作" width="180" fixed="right">

                            <template #default="{ row }">
                                <el-button v-if="row.refund_status == 0" v-perms="['ocean_card_order/check']"
                                    type="primary" link :disabled="row.refund_status == 1"
                                    @click="handleCheckPass(row.id, 1)">
                                    通过
                                </el-button>
                                <el-button v-if="row.refund_status == 0" v-perms="['ocean_card_order/check']"
                                    type="primary" link :disabled="row.refund_status == 1"
                                    @click="handleCheck(row.id, row.order_amount, row.user_id)">
                                    拒绝
                                </el-button>
                                <span v-if="row.refund_status == 1" style="color:#1c990b;">审核通过</span>
                                <span v-if="row.refund_status == 2" style="color:#b11d0c;">审核拒绝<br>({{ row.remark
                                    }})</span>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>

            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>
        <check-popup v-if="showCheck" ref="checkRef" @success="getLists" @close="showCheck = false" />
    </div>
</template>

<script lang="ts" setup name="refundRecord">
import { refundRecord, refundStat, apiWithdrawalOrderCheck } from '@/api/finance'
import { usePaging } from '@/hooks/usePaging'
import feedback from '@/utils/feedback'
import CheckPopup from './w_check.vue'
// import { util_d$1 } from 'echarts/types/dist/shared';

const checkRef = shallowRef<InstanceType<typeof CheckPopup>>()

// 是否显示编辑框
const showCheck = ref(false)
const queryParams = reactive({
    sn: '',
    order_sn: '',
    user_info: '',
    refund_type: '',
    start_time: '',
    end_time: '',
    refund_status: ''
})
const refundData = reactive({
    total: 0,
    ing: 0,
    success: 0,
    error: 0
})
const showRefundLog = ref(false)
const selectRefundId = ref(0)
const activeTab = ref(0)
const tabLists = ref([
    {
        name: '全部',
        type: '',
        numKey: 'total'
    },
    {
        name: '提现中',
        type: 0,
        numKey: 'ing'
    },
    {
        name: '提现成功',
        type: 1,
        numKey: 'success'
    },
    {
        name: '提现失败',
        type: 2,
        numKey: 'error'
    }
])

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: refundRecord,
    params: queryParams
})
// 拒绝审核
const handleCheck = async (id: any, order_amount: any, user_id: any) => {
    showCheck.value = true
    await nextTick()
    checkRef.value?.open('check')
    checkRef.value?.setFormData(id, order_amount, user_id)
}

const handleCheckPass = async (id: number | any[], refund_status: number | any[]) => {
    await feedback.confirm('确定通过审核？')
    await apiWithdrawalOrderCheck({ id, refund_status })
    getLists()
}
const handleTabChange = (index: any) => {
    queryParams.refund_status = tabLists.value[index].type as string
    resetPage()
}

const getRefundStat = async () => {
    const res = await refundStat()
    Object.assign(refundData, res)
}
getRefundStat()
getLists()
</script>./t_check.vue./w_check.vue
