import { FileListType } from '@/pages/home/types'
import { actressFaceDB } from '@/utils/actressFaceDB'
import { imageCache } from '@/utils/cache'
import { compressImage } from '@/utils/image'
import { appLogger } from '@/utils/logger'
import { userSettings } from '@/utils/userSettings'
import { FileItemModBase } from './base'

/**
 * FileItemMod 演员信息
 */
export class FileItemModActressInfo extends FileItemModBase {
  readonly IS_PLUS = true
  /** 日志 */
  protected logger = appLogger.sub('FileItemModActressInfo')

  private unwatchPlusFeature: (() => void) | null = null
  private actressDom: HTMLImageElement | null = null

  async onLoad() {
    if (!this.isPlusFeatureEnabled()) {
      return
    }
    // 如果文件列表类型为网格，则不加载演员信息
    if (this.itemInfo.fileListType === FileListType.grid) {
      return
    }

    this.watchPlusFeature()

    await actressFaceDB.init()
    const actress = await actressFaceDB.findActress(
      this.itemInfo.attributes.title.trim(),
    )
    if (!actress) {
      return
    }

    this.itemNode.classList.add('with-actress-info')
    this.actressDom = document.createElement('img')
    this.actressDom.alt = actress.filename
    this.actressDom.loading = 'lazy'
    this.actressDom.className = 'actress-info-img'
    this.itemNode.querySelector('.file-name-wrap')?.prepend(this.actressDom)

    try {
      /** 尝试从缓存获取图片 */
      const cacheKey = `actress-face-${actress.url}`
      const cachedImage = await imageCache.get(cacheKey)

      if (cachedImage) {
        if (this.actressDom) {
          this.actressDom.src = URL.createObjectURL(cachedImage.value)
        }
      }
      else {
        if (this.actressDom) {
          this.actressDom.src = actress.url
        }
        try {
          const response = await fetch(actress.url)
          if (response.ok) {
            const blob = await response.blob()

            /** 压缩图片后再缓存 */
            const compressedBlob = await compressImage(blob, {
              maxWidth: 200,
              maxHeight: 200,
              quality: 0.8,
              type: 'image/webp',
            })

            // 存储到imageCache中
            await imageCache.set(cacheKey, compressedBlob)
          }
        }
        catch (error) {
          this.logger.error('缓存演员头像失败:', error)
        }
      }
    }
    catch (error) {
      // 出错时直接使用原始URL
      this.logger.error('加载演员头像缓存失败:', error)
      if (this.actressDom) {
        this.actressDom.src = actress.url
      }
    }
  }

  onDestroy() {
    if (this.unwatchPlusFeature) {
      this.unwatchPlusFeature()
      this.unwatchPlusFeature = null
    }

    this.itemNode.classList.remove('with-actress-info')

    if (this.actressDom) {
      this.actressDom.remove()
      this.actressDom = null
    }
  }

  private isPlusFeatureEnabled(): boolean {
    return userSettings.value.plusFeatures.enableActressInfo
  }

  private watchPlusFeature() {
    if (this.unwatchPlusFeature) {
      return
    }
    this.unwatchPlusFeature = userSettings.watch('plusFeatures', () => {
      if (!this.isPlusFeatureEnabled()) {
        this.destroy()
      }
    })
  }
}
