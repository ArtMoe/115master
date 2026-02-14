import type { TopRootSearchParams } from '@/pages/home/global'
import type { App } from 'vue'
import { unsafeWindow } from '$'
import { createApp } from 'vue'
import { PLUS_VERSION } from '@/constants'
import { BaseMod } from '@/pages/home/BaseMod'
import { getUrlParams } from '@/utils/url'
import { userSettings } from '@/utils/userSettings'
import { openOfflineTask } from './openOfflineTask'
import mainStyles from '@/styles/main.css?inline'
import PlusControlPanel from '@/components/PlusControlPanel/PlusControlPanel.vue'
import './index.css'
import 'iconify-icon'

/**
 * 顶部导航栏修改器
 * @description
 * 1. 添加自定义的云下载一级按钮
 * 2. 删除官方的云下载按钮
 * 3. 云下载按钮免除刷新重定向
 * 4. 添加预览切换开关
 * 5. 添加Plus控制面板按钮
 */
export class TopHeaderMod extends BaseMod {
  private controlPanelApp: App | null = null
  private controlPanelContainer: HTMLElement | null = null

  constructor() {
    super()
    this.init()
  }

  /** 顶部导航栏节点 */
  get topHeaderNode() {
    return document.querySelector(unsafeWindow.Main.CONFIG.TopPanelBox)
      ?.firstElementChild as HTMLElement
  }

  /** 销毁 */
  destroy() {
    this.destroyControlPanel()
  }

  /** 初始化 */
  private init() {
    if (!this.topHeaderNode)
      return
    const params = getUrlParams<TopRootSearchParams>(
      top?.window.location.search ?? '',
    )
    if (params.mode === 'search') {
      return
    }

    this.addPreviewSwitchButton()
    if (PLUS_VERSION) {
      this.addPlusControlPanelButton()
    }

  }

  /** 删除官方的离线任务按钮 */
  private deleteOfficialDownloadButton() {
    const downloadButton = this.topHeaderNode?.querySelector(
      '.button[menu=\'offline_task\']',
    )
    if (downloadButton) {
      downloadButton.remove()
    }
  }

  /** 添加 Master 离线任务按钮 */
  private addMasterOfflineTaskButton() {
    const button = this.createMasterOfflineTaskButton()
    this.topHeaderNode?.prepend(button)
  }

  /** 创建 Master 离线任务按钮 */
  private createMasterOfflineTaskButton() {
    const button = document.createElement('a')
    button.classList.add('button', 'master-offline-task-btn')
    button.href = 'javascript:void(0)'
    button.innerHTML = `
            <i class="icon-operate ifo-linktask"></i>
            <span>云下载</span>
        `
    button.style.background = '#3a4783'
    button.style.borderColor = '#3a4783'
    button.onclick = () => {
      openOfflineTask()
    }
    return button
  }

  /** 添加预览切换开关 */
  private addPreviewSwitchButton() {
    const button = this.createPreviewSwitchButton()
    this.topHeaderNode?.append(button)
  }

  /** 创建预览切换开关 */
  private createPreviewSwitchButton() {
    const value = userSettings.value.enableFilelistPreview
    const button = document.createElement('a')
    button.classList.add('button', 'btn-line', 'master-preview-switch-btn')
    if (value) {
      button.classList.add('active')
    }
    button.setAttribute('title', value ? '关闭文件预览' : '开启文件预览')
    button.href = 'javascript:void(0)'
    button.innerHTML = `
      <iconify-icon class="preview-off" icon="material-symbols:image-outline" noobserver></iconify-icon>
      <iconify-icon class="preview-on" icon="material-symbols:image" noobserver></iconify-icon>
    `
    button.onclick = () => {
      userSettings.value.enableFilelistPreview
        = !userSettings.value.enableFilelistPreview
      const isActive = button.classList.toggle('active')
      button.setAttribute('title', isActive ? '关闭文件预览' : '开启文件预览')
    }
    return button
  }

  /** 修正右键菜单位置 */
  private fixContextMenuPosition(name: string) {
    const tabNode = document.querySelector<HTMLElement>(
      `[data-dropdown-tab="${name}"]`,
    )
    const contextMenuNode = document.querySelector<HTMLElement>(
      `[data-dropdown-content="${name}"]`,
    )
    if (!tabNode || !contextMenuNode)
      return
    const tabRect = tabNode.getBoundingClientRect()
    contextMenuNode.style.left = `${tabRect.left}px`
  }

  /** 添加Plus控制面板按钮 */
  private addPlusControlPanelButton() {
    const button = this.createPlusControlPanelButton()
    this.topHeaderNode?.append(button)
  }

  /** 创建Plus控制面板按钮 */
  private createPlusControlPanelButton() {
    const button = document.createElement('a')
    button.classList.add('button', 'btn-line', 'master-plus-control-btn')
    button.setAttribute('title', 'Plus 功能控制面板')
    button.href = 'javascript:void(0)'
    button.innerHTML = `
      <iconify-icon icon="material-symbols:tune" noobserver></iconify-icon>
    `
    button.onclick = () => {
      this.showControlPanel()
    }
    return button
  }

  /** 显示控制面板 */
  private showControlPanel() {
    if (this.controlPanelApp) {
      return
    }

    this.controlPanelContainer = document.createElement('div')
    this.controlPanelContainer.className = 'master-plus-control-panel-root'
    document.body.appendChild(this.controlPanelContainer)

    const shadowRoot = this.controlPanelContainer.attachShadow({ mode: 'open' })

    const styleElement = document.createElement('style')
    styleElement.textContent = mainStyles
    shadowRoot.appendChild(styleElement)

    const mountPoint = document.createElement('div')
    mountPoint.setAttribute('data-theme', 'light')
    shadowRoot.appendChild(mountPoint)

    this.controlPanelApp = createApp(PlusControlPanel, {
      onClose: () => {
        this.destroyControlPanel()
      },
    })

    this.controlPanelApp.mount(mountPoint)
  }

  /** 销毁控制面板 */
  private destroyControlPanel() {
    if (this.controlPanelApp) {
      this.controlPanelApp.unmount()
      this.controlPanelApp = null
    }
    if (this.controlPanelContainer) {
      this.controlPanelContainer.remove()
      this.controlPanelContainer = null
    }
  }
}
