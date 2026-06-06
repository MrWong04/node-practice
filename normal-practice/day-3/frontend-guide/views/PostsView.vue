<template>
  <div class="posts-page">
    <h1>文章列表</h1>
    <div v-if="authStore.isLoggedIn" class="new-post">
      <h2>发布新文章</h2>
      <input v-model="newPost.title" placeholder="标题" />
      <textarea v-model="newPost.content" placeholder="内容"></textarea>
      <button @click="createPost">发布</button>
    </div>
    <p v-else>请<router-link to="/login">登录</router-link>后发布文章</p>

    <div class="post-list">
      <div v-for="post in posts" :key="post.id" class="post-item">
        <h3>{{ post.title }}</h3>
        <p>{{ post.content }}</p>
        <small>
          作者: {{ post.author }} |
          {{ new Date(post.createdAt).toLocaleString() }}
        </small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useAuthStore } from '../stores/auth'
import request from '../api/request'

const authStore = useAuthStore()
const posts = ref([])
const newPost = reactive({ title: '', content: '' })

async function fetchPosts() {
  const res = await request.get('/posts')
  if (res.success) {
    posts.value = res.data
  }
}

async function createPost() {
  try {
    const res = await request.post('/posts', newPost)
    if (res.success) {
      newPost.title = ''
      newPost.content = ''
      await fetchPosts()
    }
  } catch (err) {
    alert(err.message)
  }
}

onMounted(fetchPosts)
</script>

<style scoped>
.posts-page { max-width: 800px; margin: 0 auto; padding: 20px; }
.new-post { margin-bottom: 30px; padding: 15px; background: #f5f5f5; }
.new-post input, .new-post textarea { width: 100%; margin-bottom: 10px; padding: 8px; }
.post-item { padding: 15px; border-bottom: 1px solid #eee; }
</style>
