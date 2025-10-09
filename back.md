# Prompt: 音乐管理系统后端开发技术文档

## 1. 项目概述 (Project Overview)

你是一名专业的后端开发者。你的任务是使用 Next.js App Router 作为后端框架，构建一个功能完善的“音乐管理系统”的所有 API 接口和服务端逻辑。

**核心理念**:
* **管理端**: 系统提供强大的后台功能，允许管理员 (Admin) 对曲库（歌曲、歌手、专辑、分类）进行完整的增删改查操作。
* **用户端**: 普通用户 (User) 可以在此基础上创建和管理个人歌单。
* **注意**: 此任务**仅专注于后端 API 的实现**，不涉及任何前端 UI 开发。

## 2. 技术栈 (Tech Stack)

* **框架 / 运行时**: Next.js (App Router) / Node.js
* **语言**: TypeScript
* **数据库 ORM**: Prisma
* **数据库**: MySQL
* **认证**: JWT (JSON Web Tokens)，通过 HTTP Only Cookie 进行传输
* **密码处理**: bcryptjs

## 3. 数据库 Schema 设计 (Prisma Schema)

这是项目所有数据结构的“唯一真实来源”，基于你提供的最新版本。

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// 用户表
model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  username     String   @unique
  name         String?
  avatar       String?
  passwordHash String
  role         UserRole @default(USER)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  playlists Playlist[]
}

// 艺术家表
model Artist {
  id          Int      @id @default(autoincrement())
  name        String
  avatar      String?
  description String?  @db.Text
  country     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  songs  Song[]
  albums Album[]
}

// 专辑表
model Album {
  id          Int      @id @default(autoincrement())
  title       String
  cover       String?
  releaseDate DateTime?
  description String?  @db.Text
  artistId    Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  artist Artist @relation(fields: [artistId], references: [id], onDelete: Cascade)
  songs  Song[]
}

// 分类表
model Category {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  description String?
  color       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  songs Song[] @relation("SongCategories")
}

// 歌曲表
model Song {
  id          Int      @id @default(autoincrement())
  title       String
  duration    Int?
  fileUrl     String?
  cover       String?
  lyrics      String?  @db.Text
  artistId    Int
  albumId     Int?
  trackNumber Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  artist        Artist         @relation(fields: [artistId], references: [id], onDelete: Cascade)
  album         Album?         @relation(fields: [albumId], references: [id], onDelete: SetNull)
  categories    Category[]     @relation("SongCategories")
  playlistSongs PlaylistSong[]
}

// 歌单表
model Playlist {
  id          Int      @id @default(autoincrement())
  name        String
  description String?  @db.Text
  cover       String?
  isPublic    Boolean  @default(true)
  userId      Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  playlistSongs PlaylistSong[]
}

// 歌单歌曲关联表
model PlaylistSong {
  id         Int      @id @default(autoincrement())
  playlistId Int
  songId     Int
  order      Int
  addedAt    DateTime @default(now())

  playlist Playlist @relation(fields: [playlistId], references: [id], onDelete: Cascade)
  song     Song     @relation(fields: [songId], references: [id], onDelete: Cascade)

  @@unique([playlistId, songId])
  @@unique([playlistId, order])
}

// 枚举
enum UserRole {
  ADMIN
  MANAGER
  USER
}
```

**角色说明**:
* `ADMIN`: 拥有完整后台权限，可管理所有资源与平台配置。
* `MANAGER`: 限于内容运营权限，可对歌曲/歌手/专辑/分类执行 CRUD，但无法进行系统级操作（例如创建管理员账号）。
* `USER`: 默认注册角色，只能访问个人歌单与公共资源。

## 4. API 接口规范 (API Endpoint Specifications)

所有需要认证的接口，都应通过一个全局的 `middleware.ts` 进行 JWT 验证。中间件需跳过公开路由（`/api/auth/*`、`GET /api/playlists`、公开歌单详情等），并对其余请求执行角色校验；建议为登录接口加入限流或验证码机制，防止暴力破解。

### 4.1 认证模块 (`/api/auth`)

* **`POST /api/auth/register`**: 用户注册。
* **`POST /api/auth/login`**: 用户登录。
* **`POST /api/auth/logout`**: 用户退出。

### 4.2 后台管理模块 (`/api/admin`)

所有接口都需要验证用户是否为 `ADMIN` 或 `MANAGER` 角色。

* **歌曲库: `/api/admin/songs`**
    * `GET`: 获取歌曲列表（支持分页、按歌名/歌手/专辑/分类搜索）。
    * `POST`: 添加新歌。请求体: `{ "title", "duration"?, "fileUrl"?, "cover"?, "lyrics"?, "artistId", "albumId"?, "categoryIds"?, "trackNumber"? }`；当传入 `categoryIds` 时需完整覆盖歌曲与分类的多对多关系。
* **歌曲库 (详情): `/api/admin/songs/:id`**
    * `GET`: 获取单首歌曲的详细信息。
    * `PUT`: 更新歌曲信息，允许同步更新 `categoryIds`。
    * `DELETE`: 删除歌曲。
* **艺术家库: `/api/admin/artists` 和 `/api/admin/artists/:id`**
    * 实现完整的 GET, POST, PUT, DELETE。
    * 请求体: `{ "name", "avatar"?, "description"?, "country"? }`。
* **专辑库: `/api/admin/albums` 和 `/api/admin/albums/:id`**
    * 实现完整的 GET, POST, PUT, DELETE。
    * 请求体: `{ "title", "cover"?, "releaseDate"?, "description"?, "artistId" }`。
* **分类库: `/api/admin/categories` 和 `/api/admin/categories/:id`**
    * 实现完整的 GET, POST, PUT, DELETE。
    * 请求体: `{ "name", "description"?, "color"? }`。

> **数据一致性要求**: 所有写操作在执行前都必须校验外键是否存在（如 `artistId`、`albumId`、`categoryIds`），必要时使用事务确保批量更新的原子性；删除实体时应处理或级联清理相关资源。

### 4.3 用户模块 (`/api/users`)

* **`GET /api/users/me`**: 获取当前登录用户的信息。
* **`PUT /api/users/me`**: 更新当前用户的个人资料（name, avatar）。

### 4.4 歌单模块 (`/api/playlists`)

* **`GET /api/playlists`**: 发现公开歌单（支持分页、按歌单名搜索）。
* **`POST /api/playlists`**: 当前登录用户创建新歌单。请求体: `{ "name", "description"?, "cover"?, "isPublic"? }`。
* **`GET /api/playlists/my`**: 获取当前用户创建的所有歌单。
* **`GET /api/playlists/:id`**: 获取单个歌单的详细信息。
    * **逻辑**: 如果歌单是私有的，则必须验证请求者是否为歌单创建者。
* **`PUT /api/playlists/:id`**: 更新歌单信息。仅限创建者操作。
* **`DELETE /api/playlists/:id`**: 删除歌单。仅限创建者操作。
* **`POST /api/playlists/:id/songs`**: 向指定歌单添加一首歌。仅限创建者操作。请求体: `{ "songId", "order"? }`；当未提供 `order` 时默认追加到末尾，若重复添加需返回冲突错误。
* **`DELETE /api/playlists/:id/songs/:songId`**: 从指定歌单移除一首歌。仅限创建者操作。
* **排序维护**: 添加、删除或调整歌曲顺序时应在事务中重排 `order`，确保 `playlistId + order` 唯一约束不被破坏。

## 5. 非功能性要求

* **输入验证**: 所有 API 的请求体和参数都必须经过严格的验证（推荐使用 `zod`）。
* **错误处理**: 提供统一、规范的错误响应格式。
* **安全性**: 对所有需要认证的接口强制执行权限检查，并为登录等敏感接口配置限流或额外校验。
* **数据一致性**: 写操作使用事务处理，确保歌单排序、分类关联等多表更新的原子性。

---
**任务开始**: 请根据以上文档，开始实现所有后端的 API 路由和服务端逻辑。
