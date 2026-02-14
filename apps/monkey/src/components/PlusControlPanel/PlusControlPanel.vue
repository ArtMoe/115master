<template>
  <div :class="styles.overlay" @click="handleClose">
    <div :class="styles.panel.container" @click.stop>
      <!-- 头部 -->
      <div :class="styles.panel.header">
        <div :class="styles.panel.title">
          <iconify-icon icon="material-symbols:settings" :class="styles.panel.titleIcon" />
          <span>Plus 功能控制面板</span>
        </div>
        <button :class="styles.panel.closeBtn" @click="handleClose">
          <iconify-icon icon="material-symbols:close" />
        </button>
      </div>

      <!-- 内容 -->
      <div :class="styles.panel.content">
        <!-- Plus 版本状态 -->
        <div :class="styles.section.container">
          <div :class="styles.section.header">
            <iconify-icon icon="material-symbols:info-outline" :class="styles.section.icon" />
            <span>版本信息</span>
          </div>
          <div :class="styles.status.container">
            <div :class="styles.status.item">
              <span :class="styles.status.label">当前版本</span>
              <span :class="[styles.status.badge, PLUS_VERSION ? styles.status.badgePlus : styles.status.badgeNormal]">
                {{ PLUS_VERSION ? 'Plus 版本' : '普通版本' }}
              </span>
            </div>
            <div v-if="!PLUS_VERSION" :class="styles.status.tip">
              <iconify-icon icon="material-symbols:info" />
              <span>当前为普通版本，Plus 功能不可用</span>
            </div>
          </div>
        </div>

        <!-- Plus 功能开关 -->
        <div v-if="PLUS_VERSION" :class="styles.section.container">
          <div :class="styles.section.header">
            <iconify-icon icon="material-symbols:toggle-on" :class="styles.section.icon" />
            <span>功能开关</span>
          </div>
          <div :class="styles.features.container">
            <!-- 文件列表扩展信息 -->
            <div :class="styles.features.item">
              <div :class="styles.features.info">
                <div :class="styles.features.title">
                  <iconify-icon icon="material-symbols:video-library" :class="styles.features.icon" />
                  <span>文件列表扩展信息</span>
                </div>
                <p :class="styles.features.desc">
                  在文件列表中显示影片详细信息，包括封面、标题、演员等（需要识别番号）
                </p>
              </div>
              <input
                type="checkbox"
                :checked="settings.plusFeatures.enableExtInfo"
                :class="styles.features.toggle"
                @change="handleToggleExtInfo"
              >
            </div>

            <!-- 演员信息显示 -->
            <div :class="styles.features.item">
              <div :class="styles.features.info">
                <div :class="styles.features.title">
                  <iconify-icon icon="material-symbols:person" :class="styles.features.icon" />
                  <span>演员信息显示</span>
                </div>
                <p :class="styles.features.desc">
                  在文件列表中显示演员头像（根据文件名自动匹配演员数据库）
                </p>
              </div>
              <input
                type="checkbox"
                :checked="settings.plusFeatures.enableActressInfo"
                :class="styles.features.toggle"
                @change="handleToggleActressInfo"
              >
            </div>

            <!-- 视频播放页电影信息 -->
            <div :class="styles.features.item">
              <div :class="styles.features.info">
                <div :class="styles.features.title">
                  <iconify-icon icon="material-symbols:movie" :class="styles.features.icon" />
                  <span>视频播放页电影信息</span>
                </div>
                <p :class="styles.features.desc">
                  在视频播放页面显示详细的电影信息面板，包括演员、片商、类别、预览图等
                </p>
              </div>
              <input
                type="checkbox"
                :checked="settings.plusFeatures.enableMovieInfo"
                :class="styles.features.toggle"
                @change="handleToggleMovieInfo"
              >
            </div>
          </div>
        </div>

        <!-- 说明 -->
        <div :class="styles.note.container">
          <iconify-icon icon="material-symbols:lightbulb-outline" :class="styles.note.icon" />
          <div :class="styles.note.content">
            <p :class="styles.note.title">使用说明</p>
            <ul :class="styles.note.list">
              <li>关闭 Plus 功能后，将自动退回到普通版本的对应功能</li>
              <li>扩展信息和演员信息关闭后，将显示普通的视频封面</li>
              <li>设置会自动保存，刷新页面后生效</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PLUS_VERSION } from '@/constants'
import { clsx } from '@/utils/clsx'
import { userSettings } from '@/utils/userSettings'
import 'iconify-icon'

const emit = defineEmits<{
  close: []
}>()

const settings = userSettings.value

const handleClose = () => {
  emit('close')
}

const handleToggleExtInfo = () => {
  settings.plusFeatures.enableExtInfo = !settings.plusFeatures.enableExtInfo
}

const handleToggleActressInfo = () => {
  settings.plusFeatures.enableActressInfo = !settings.plusFeatures.enableActressInfo
}

const handleToggleMovieInfo = () => {
  settings.plusFeatures.enableMovieInfo = !settings.plusFeatures.enableMovieInfo
}

const styles = clsx({
  // 遮罩层
  overlay: 'fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center',

  // 面板
  panel: {
    container: 'bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden',
    header: 'flex items-center justify-between px-6 py-4 border-b border-base-300',
    title: 'flex items-center gap-3 text-xl font-bold text-base-content',
    titleIcon: 'text-2xl text-primary',
    closeBtn: 'btn btn-sm btn-ghost btn-circle',
    content: 'overflow-y-auto p-6 flex flex-col gap-6',
  },

  // 分区
  section: {
    container: 'flex flex-col gap-4',
    header: 'flex items-center gap-2 text-lg font-semibold text-base-content',
    icon: 'text-xl text-primary',
  },

  // 状态
  status: {
    container: 'flex flex-col gap-3',
    item: 'flex items-center justify-between py-3 px-4 bg-base-200 rounded-xl',
    label: 'text-base-content/70',
    badge: 'badge badge-lg font-medium',
    badgePlus: 'badge-primary',
    badgeNormal: 'badge-neutral',
    tip: 'flex items-center gap-2 text-sm text-warning px-4 py-2 bg-warning/10 rounded-lg',
  },

  // 功能列表
  features: {
    container: 'flex flex-col gap-4',
    item: 'flex items-center justify-between gap-4 p-4 bg-base-200 rounded-xl hover:bg-base-300 transition-colors',
    info: 'flex-1 flex flex-col gap-2',
    title: 'flex items-center gap-2 text-base font-medium text-base-content',
    icon: 'text-lg text-primary',
    desc: 'text-sm text-base-content/60 leading-relaxed',
    toggle: 'toggle toggle-primary toggle-lg',
  },

  // 说明
  note: {
    container: 'flex gap-3 p-4 bg-info/10 rounded-xl border border-info/20',
    icon: 'text-xl text-info mt-0.5 flex-shrink-0',
    content: 'flex-1',
    title: 'text-sm font-medium text-info mb-2',
    list: 'text-sm text-base-content/70 space-y-1 list-disc list-inside',
  },
})
</script>
