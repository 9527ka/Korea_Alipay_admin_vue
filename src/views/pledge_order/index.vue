<template>
    <div>
        <el-card class="!border-none mb-4" shadow="never">
            <el-form class="mb-[-16px]" :model="queryParams" inline>
                <!-- <el-form-item label="产品id" prop="pledge_id">
                    <el-input class="w-[280px]" v-model="queryParams.pledge_id" clearable placeholder="请输入产品id" />
                </el-form-item> -->
                <el-form-item label="用户账号" prop="user_id">
                    <el-input class="w-[280px]" v-model="queryParams.account" clearable placeholder="请输入用户账号" />
                </el-form-item>
                <el-form-item label="创建时间" prop="create_time">
                    <daterange-picker v-model:startTime="queryParams.start_time"
                        v-model:endTime="queryParams.end_time" />
                </el-form-item>

                <el-form-item label="质押状态" prop="status">
                    <el-select class="w-[280px]" v-model="queryParams.status" clearable placeholder="请选择质押状态">
                        <el-option label="全部" value=""></el-option>
                        <el-option v-for="(item, index) in dictData.pledge_status" :key="index" :label="item.name"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="resetPage">查询</el-button>
                    <el-button @click="resetParams">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="!border-none" v-loading="pager.loading" shadow="never">
            <!-- <el-button v-perms="['pledge_order/add']" type="primary" @click="handleAdd">
                <template #icon>
                    <icon name="el-icon-Plus" />
                </template>
新增
</el-button> -->
            <el-button v-perms="['pledge_order/delete']" :disabled="!selectData.length"
                @click="handleDelete(selectData)">
                删除
            </el-button>
            <div class="mt-4">
                <el-table :data="pager.lists" @selection-change="handleSelectionChange">
                    <el-table-column type="selection" width="55" />
                    <el-table-column label="产品" prop="name" show-overflow-tooltip />
                    <el-table-column label="用户账号" prop="account" show-overflow-tooltip />
                    <el-table-column label="利率%" prop="rate" show-overflow-tooltip />
                    <el-table-column label="质押金额" prop="amount" show-overflow-tooltip />
                    <el-table-column label="创建时间" prop="create_time">

                        <template #default="{ row }">
                            <span>{{ row.create_time ? timeFormat(row.create_time, 'yyyy-mm-dd hh:MM:ss') : '' }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="到期时间" prop="expiration_time" show-overflow-tooltip />
                    <el-table-column label="质押状态" prop="status">

                        <template #default="{ row }">
                            <dict-value :options="dictData.pledge_status" :value="row.status" />
                        </template>
                    </el-table-column>
                    <el-table-column label="返利金额" prop="rebate_amount" show-overflow-tooltip />
                    <!-- <el-table-column label="操作" width="120" fixed="right">
                        <template #default="{ row }">
                             <el-button
                                v-perms="['pledge_order/edit']"
                                type="primary"
                                link
                                @click="handleEdit(row)"
                            >
                                编辑
                            </el-button>
                            <el-button
                                v-perms="['pledge_order/delete']"
                                type="danger"
                                link
                                @click="handleDelete(row.id)"
                            >
                                删除
                            </el-button>
                        </template>
                    </el-table-column> -->
                </el-table>
            </div>
            <div class="flex mt-4 justify-end">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>
        <edit-popup v-if="showEdit" ref="editRef" :dict-data="dictData" @success="getLists" @close="showEdit = false" />
    </div>
</template>

<script lang="ts" setup name="pledgeOrderLists">
import { usePaging } from '@/hooks/usePaging'
import { useDictData } from '@/hooks/useDictOptions'
import { apiPledgeOrderLists, apiPledgeOrderDelete } from '@/api/pledge_order'
import { timeFormat } from '@/utils/util'
import feedback from '@/utils/feedback'
import EditPopup from './edit.vue'

const editRef = shallowRef<InstanceType<typeof EditPopup>>()
// 是否显示编辑框
const showEdit = ref(false)

// 查询条件
const queryParams = reactive({
    pledge_id: '',
    account: '',
    create_time: '',
    status: '',
    start_time: '',
    end_time: ''
})

// 选中数据
const selectData = ref<any[]>([])

// 表格选择后回调事件
const handleSelectionChange = (val: any[]) => {
    selectData.value = val.map(({ id }) => id)
}

// 获取字典数据
const { dictData } = useDictData('pledge_status')

// 分页相关
const { pager, getLists, resetParams, resetPage } = usePaging({
    fetchFun: apiPledgeOrderLists,
    params: queryParams
})

// 添加
const handleAdd = async () => {
    showEdit.value = true
    await nextTick()
    editRef.value?.open('add')
}

// 编辑
const handleEdit = async (data: any) => {
    showEdit.value = true
    await nextTick()
    editRef.value?.open('edit')
    editRef.value?.setFormData(data)
}

// 删除
const handleDelete = async (id: number | any[]) => {
    await feedback.confirm('确定要删除？')
    await apiPledgeOrderDelete({ id })
    getLists()
}

getLists()
</script>
