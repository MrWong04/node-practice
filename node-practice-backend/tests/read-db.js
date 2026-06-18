// ============================================
// 直接读取 SQLite 数据库脚本
// 演示 Prisma Client 如何查询数据
// ============================================

const { prisma } = require('../prisma/client')

async function readDatabase() {
  console.log('============================================')
  console.log('📊 数据库数据读取演示')
  console.log('============================================\n')

  try {
    // 1. 读取所有用户
    console.log('👥 用户表 (users)：')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        // 注意：不读取 password 字段（安全）
      },
      orderBy: { createdAt: 'desc' },
    })

    if (users.length === 0) {
      console.log('   (暂无用户)\n')
    } else {
      users.forEach((u) => {
        console.log(
          `   ID:${u.id} | ${u.email} | ${u.name || '未命名'} | ${u.createdAt.toISOString()}`
        )
      })
      console.log(`   总计: ${users.length} 个用户\n`)
    }

    // 2. 读取所有文章
    console.log('📝 文章表 (posts)：')
    const posts = await prisma.post.findMany({
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (posts.length === 0) {
      console.log('   (暂无文章)\n')
    } else {
      posts.forEach((p) => {
        console.log(`   ID:${p.id} | ${p.title}`)
        console.log(`      作者: ${p.author} (用户ID: ${p.authorId || '无'})`)
        console.log(
          `      内容: ${p.content.substring(0, 50)}${p.content.length > 50 ? '...' : ''}`
        )
        console.log(`      时间: ${p.createdAt.toISOString()}`)
        if (p.user) {
          console.log(`      关联用户: ${p.user.name} (${p.user.email})`)
        }
        console.log('')
      })
      console.log(`   总计: ${posts.length} 篇文章\n`)
    }

    // 3. 统计信息
    console.log('📈 统计信息：')
    const userCount = await prisma.user.count()
    const postCount = await prisma.post.count()
    console.log(`   用户总数: ${userCount}`)
    console.log(`   文章总数: ${postCount}`)

    // 4. 演示条件查询：查找特定用户的文章
    if (users.length > 0) {
      const firstUser = users[0]
      console.log(`\n🔍 条件查询示例：用户 "${firstUser.email}" 的文章`)
      const userPosts = await prisma.post.findMany({
        where: { authorId: firstUser.id },
      })
      console.log(`   该用户共有 ${userPosts.length} 篇文章`)
    }

    console.log('\n============================================')
    console.log('✅ 读取完成！')
    console.log('============================================')
  } catch (err) {
    console.error('❌ 读取失败:', err.message)
  } finally {
    await prisma.$disconnect()
  }
}

readDatabase()
