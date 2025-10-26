/**
 * 创建基础标签脚本
 */

const { PrismaClient } = require('../../src/generated/prisma');

const prisma = new PrismaClient();

const defaultTags = [
  {
    name: '流行',
    color: '#FF6B6B',
    description: '流行音乐'
  },
  {
    name: '摇滚',
    color: '#4ECDC4',
    description: '摇滚音乐'
  },
  {
    name: '民谣',
    color: '#45B7D1',
    description: '民谣音乐'
  },
  {
    name: '电子',
    color: '#96CEB4',
    description: '电子音乐'
  },
  {
    name: '古典',
    color: '#FFEAA7',
    description: '古典音乐'
  },
  {
    name: '爵士',
    color: '#DDA0DD',
    description: '爵士音乐'
  },
  {
    name: '轻音乐',
    color: '#A8E6CF',
    description: '轻音乐、背景音乐'
  },
  {
    name: '欧美',
    color: '#FFD700',
    description: '欧美音乐'
  },
  {
    name: '华语',
    color: '#FF69B4',
    description: '华语音乐'
  },
  {
    name: '日韩',
    color: '#87CEEB',
    description: '日韩音乐'
  }
];

async function seedTags() {
  try {
    console.log('开始创建基础标签...');

    for (const tag of defaultTags) {
      // 检查标签是否已存在
      const existingTag = await prisma.tag.findUnique({
        where: { name: tag.name }
      });

      if (!existingTag) {
        await prisma.tag.create({
          data: {
            name: tag.name,
            color: tag.color,
            description: tag.description
          }
        });
        console.log(`✓ 创建标签: ${tag.name}`);
      } else {
        console.log(`- 标签已存在: ${tag.name}`);
      }
    }

    console.log('✅ 标签创建完成！');

    // 查看所有标签
    const allTags = await prisma.tag.findMany();
    console.log('\n当前所有标签:');
    allTags.forEach(tag => {
      console.log(`  ${tag.id}. ${tag.name} (${tag.color})`);
    });

  } catch (error) {
    console.error('❌ 创建标签失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTags();