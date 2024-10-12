<template>
    <div class="image-zoom">
        <img :src="imageSrc" @click="toggleModal" alt="缩略图" />
        <transition name="fade">
            <div v-if="isModalVisible" class="modal-overlay" @click="toggleModal">
                <div class="modal-content" @click.stop>
                    <img :src="imageSrc" alt="放大后的图片" />
                    <button class="close-btn" @click="toggleModal">关闭</button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

// 定义 props
const props = defineProps<{
    imageSrc: string;
}>();

// 控制模态框的显示状态
const isModalVisible = ref(false);

// 切换模态框的显示状态
const toggleModal = () => {
    isModalVisible.value = !isModalVisible.value;
};
</script>

<style scoped>
.image-zoom img {
    cursor: pointer;
    transition: transform 0.3s ease-in-out;
}

.image-zoom img:hover {
    transform: scale(1.1);
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.75);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: white;
    padding: 20px;
    max-width: 90%;
    max-height: 90%;
    position: relative;
    text-align: center;
}

.modal-content img {
    max-width: 100%;
    max-height: 100%;
}

.close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #f44336;
    color: white;
    border: none;
    padding: 10px 15px;
    cursor: pointer;
    border-radius: 5px;
}

.close-btn:hover {
    background-color: #d32f2f;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>