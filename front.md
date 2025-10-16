# Prompt: 歌单管理系统前端开发技术文档

## 1. 项目概述 (Project Overview)

你是一名专业的前端开发者。你的任务是使用 Next.js App Router，为已经定义好的“歌单管理系统”后端 API 构建一个功能完整、用户友好的 Web 前端界面。

**核心理念**:
* **数据驱动**: 界面完全由后端 API 驱动，负责对数据进行清晰的展示和提供便捷的操作入口。
* **角色分离**: 系统需要明确区分普通用户视图和管理员后台视图，并根据用户角色进行权限控制。
* **响应式设计**: 应用需要能良好地适配桌面和移动设备。

## 2. 技术栈 (Tech Stack)

* **框架**: Next.js (App Router)
* **语言**: TypeScript
* **UI/样式**: Tailwind CSS
* **组件库 (推荐)**: Shadcn - 用于快速构建高质量的 UI 元素，如按钮、表单、表格、弹窗等。
* **状态管理 (推荐)**:  React Context - 用于管理全局状态，如当前登录用户信息。

## 3. 页面与路由结构 (Page & Route Structure)

基于 App Router，项目的核心页面结构如下：

```
/app
├── /admin/                     # 管理员后台路由组
│   ├── layout.tsx              # 后台通用布局 (侧边栏、顶部导航)
│   ├── page.tsx                # 后台首页 (Dashboard)
│   ├── /songs/page.tsx         # 歌曲管理页
│   ├── /artists/page.tsx       # 歌手管理页
│   └── /albums/page.tsx        # 专辑管理页
│
├── /auth/                      # 认证路由组
│   ├── /login/page.tsx         # 登录页
│   └── /register/page.tsx      # 注册页
│
├── /playlists/
│   ├── /create/page.tsx        # 创建歌单页
│   ├── /[id]/page.tsx          # 歌单详情页
│   └── /edit/[id]/page.tsx     # 编辑歌单页
│
├── /library/                   # 个人音乐库
│   ├── layout.tsx              # 个人库布局 (例如带Tabs切换)
│   └── page.tsx                # 默认展示“我创建的歌单”
│
├── /discover/page.tsx          # 发现广场页
├── /search/page.tsx            # 搜索页
└── page.tsx                    # 应用首页 (可重定向到 /discover)
```

## 4. 页面详细设计 (Detailed Page Designs)

### 4.1 认证页面 (`/auth`)

* **登录页 (`/auth/login`)**:
    * **内容**: 包含“用户名”和“密码”输入框，一个“登录”按钮。
    * **交互**: 表单提交时，调用 `POST /api/auth/login`。处理 loading 和 error 状态。成功后跳转到首页或用户指定页面。
* **注册页 (`/auth/register`)**:
    * **内容**: 包含“邮箱”、“用户名”、“密码”、“昵称”输入框，一个“注册”按钮。
    * **交互**: 调用 `POST /api/auth/register`。成功后提示用户，并跳转到登录页。

### 4.2 核心用户页面

* **发现页 (`/discover`)**:
    * **内容**: 以网格或列表形式展示公开的歌单 (`PlaylistCard` 组件)。
    * **数据**: 调用 `GET /api/playlists` 获取公开歌单列表，支持分页。
    * **交互**: 点击任意歌单卡片，跳转到 `/playlists/[id]` 详情页。
* **歌单详情页 (`/playlists/[id]`)**:
    * **内容**:
        * `PlaylistHeader` 组件：展示歌单封面、名称、描述、创建者信息。
        * `SongList` 组件：展示歌单内的歌曲列表，包含序号、歌名、歌手、专辑、时长。
    * **数据**: 调用 `GET /api/playlists/:id` 获取歌单全部信息。
    * **交互**:
        * 如果当前用户是创建者，显示“编辑歌单”、“添加歌曲”、“删除歌单”按钮。
        * 歌曲列表支持拖拽排序（调用 `PUT /api/playlists/:id/songs/order`）。
        * 每首歌曲旁有“移除”按钮（调用 `DELETE /api/playlists/:id/songs`）。
        * 如果不是创建者，显示“收藏/取消收藏”按钮（调用 `POST/DELETE /api/playlists/:id/follow`）。
* **个人音乐库 (`/library`)**:
    * **内容**:
        * Tabs 组件，用于切换“我创建的”和“我收藏的”歌单。
        * 默认展示“我创建的”歌单列表。
    * **数据**:
        * “我创建的”Tab 调用 `GET /api/playlists/my`。
        * “我收藏的”Tab 调用 `GET /api/playlists/followed`。
* **创建/编辑歌单页 (`/playlists/create`, `/playlists/edit/[id]`)**:
    * **内容**: 一个表单，包含歌单名称、描述、封面 URL 输入框，以及一个“是否公开”的开关 (Switch)。
    * **数据**: 编辑模式下，先调用 `GET /api/playlists/:id` 填充表单默认值。
    * **交互**: 提交表单时，分别调用 `POST /api/playlists` 或 `PUT /api/playlists/:id`。

### 4.3 后台管理页面 (`/admin`)

* **通用布局 (`/admin/layout.tsx`)**:
    * **内容**: 包含一个侧边导航栏（链接到歌曲、歌手、专辑管理）和一个顶部用户信息栏。
    * **逻辑**: 在此布局的 server component 部分或中间件中进行严格的 `ADMIN` 角色校验。
* **歌曲管理页 (`/admin/songs`)**:
    * **内容**:
        * 一个包含所有歌曲的**数据表格 (Data Table)**，列有：ID, 歌名, 歌手, 专辑, 时长。
        * 表格上方有“添加歌曲”按钮和搜索框。
        * 每一行都有“编辑”和“删除”操作按钮。
    * **数据**: 调用 `GET /api/admin/songs`，支持分页和搜索。
    * **交互**:
        * 点击“添加歌曲”弹出模态框 (Modal)，提交时调用 `POST /api/admin/songs`。
        * 点击“编辑”弹出模态框，填充数据，提交时调用 `PUT /api/admin/songs/:id`。
        * 点击“删除”弹出确认框，确认后调用 `DELETE /api/admin/songs/:id`。
* **歌手/专辑管理页**: 布局和逻辑与歌曲管理页完全相同，只是处理的数据和接口不同。

## 5. 组件架构建议 (Component Architecture)

* **`/components/ui`**: 存放通用、无业务逻辑的原子组件，如 `Button`, `Input`, `Card`, `Modal`, `Table`, `Tabs`。
* **`/components/domain`**: 存放与特定业务领域相关的组件，如：
    * `PlaylistCard.tsx`: 在发现页和个人库页显示的歌单卡片。
    * `SongList.tsx`: 在歌单详情页显示的歌曲列表。
    * `AdminSongTable.tsx`: 后台管理的歌曲数据表格。
    * `AuthForm.tsx`: 登录/注册表单。

---
**任务开始**: 请根据以上前端技术文档，开始构建应用的 UI 界面和交互逻辑。