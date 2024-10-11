<template>
    <div>
        <el-card class="!border-none mb-4" shadow="never">
            <el-form
                class="mb-[-16px]"
                :model="queryParams"
                inline
            >
                <el-form-item label="是否超级管理员 0-否 1-是" prop="root">
                    <el-input class="w-[280px]" v-model="queryParams.root" clearable placeholder="请输入是否超级管理员 0-否 1-是" />
                </el-form-item>
                <el-form-item label="名称" prop="name">
                    <el-input class="w-[280px]" v-model="queryParams.name" clearable placeholder="请输入名称" />
                </el-form-item>
                <el-form-item label="用户头像" prop="avatar">
                    <el-input class="w-[280px]" v-model="queryParams.avatar" clearable placeholder="请输入用户头像" />
                </el-form-item>
                <el-form-item label="账号" prop="account">
                    <el-input class="w-[280px]" v-model="queryParams.account" clearable placeholder="请输入账号" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input class="w-[280px]" v-model="queryParams.password" clearable placeholder="请输入密码" />
                </el-form-item>
                <el-form-item label="最后登录时间" prop="login_time">
                    <el-input class="w-[280px]" v-model="queryParams.login_time" clearable placeholder="请输入最后登录时间" />
                </el-form-item>
                <el-form-item label="最后登录ip" prop="login_ip">
                    <el-input class="w-[280px]" v-model="queryParams.login_ip" clearable placeholder="请输入最后登录ip" />
                </el-form-item>
                <el-form-item label="是否支持多处登录：1-是；0-否；" prop="multipoint_login">
                    <el-input class="w-[280px]" v-model="queryParams.multipoint_login" clearable placeholder="请输入是否支持多处登录：1-是；0-否；" />
                </el-form-item>
                <el-form-item label="是否禁用：0-否；1-是；" prop="disable">
                    <el-input class="w-[280px]" v-model="queryParams.disable" clearable placeholder="请输入是否禁用：0-否；1-是；" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="resetPage">查询</el-button>
                    <el-button @click="resetParams">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="!border-none" v-loading="pager.loading" shadow="never">
            <el-button v-perms="['admin/add']" type="primary" @click="handleAdd">
                <template #icon>
                    <icon name="el-icon-Plus" />
                </template>
                新增
            </el-button>
            <el-button
                v-perms="['admin/delete']"
                :disabled="!selectData.length"
                @click="handleDelete(selectData)"
            >
                删除
            </el-button>
            <div class="mt-4">
                <el-table :data="pager.lists" @selection-change="handleSelectionChange">
                    <el-table-column type="selection" width="55" />
                    <el-table-column label="是否超级管理员 0-否 1-是" prop="root" show-overflow-tooltip />
                    <el-table-column label="名称" prop="name" show-overflow-tooltip />
                    <el-table-column label="用户头像" prop="avatar" show-overflow-tooltip />
                    <el-table-column label="账号" prop="account" show-overflow-tooltip />
                    <el-table-column label="密码" prop="password" show-overflow-tooltip />
                    <el-table-column label="最后登录时间" prop="login_time" show-overflow-tooltip />
                    <el-table-column label="最后登录ip" prop="login_ip" show-overflow-tooltip />
                    <el-table-column label="是否支持多处登录：1-是；0-否；" prop="multipoint_login" show-overflow-tooltip />
                    <el-table-column label="是否禁用：0-否；1-是；" prop="disable" show-overflow-tooltip />
                    <el-table-column label="操作" width="120" fixed="right">
                        <template #default="{ row }">
                             <el-button
                                v-perms="['admin/edit']"
                                type="primary"
                                link
                                @click="handleEdit(row)"
                            >
                                编辑
                            </el-button>
                            <el-button
                                v-perms="['admin/delete']"
                                type="danger"
                                link
                                @click="handleDelete(row.id)"
                            >
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="flex mt-4 justify-end">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>
        <edit-popup v-if="showEdit" ref="editRef" :dict-data="dictData" @success="getLists" @close="showEdit = false" />
    </div>
</template>

<script lang="ts" setup name="adminLists">
import { usePaging } from '@/hooks/usePaging'
import { useDictData } from '@/hooks/useDictOptions'
import { apiAdminLists, apiAdminDelete } from '@/api/admin'
import { timeFormat } from '@/utils/util'
import feedback from '@/utils/feedback'
import EditPopup from './edit.vue'

const editRef = shallowRef<InstanceType<typeof EditPopup>>()
// 是否显示编辑框
const showEdit = ref(false)


// 查询条件
const queryParams = reactive({
    root: '',
    name: '',
    avatar: '',
    account: '',
    password: '',
    login_time: '',
    login_ip: '',
    multipoint_login: '',
    disable: ''
})

// 选中数据
const selectData = ref<any[]>([])

// 表格选择后回调事件
const handleSelectionChange = (val: any[]) => {
    selectData.value = val.map(({ id }) => id)
}

// 获取字典数据
const { dictData } = useDictData('')

// 分页相关
const { pager, getLists, resetParams, resetPage } = usePaging({
    fetchFun: apiAdminLists,
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
    await apiAdminDelete({ id })
    getLists()
}

getLists()
</script>

