import { GM_registerMenuCommand } from '$'
import Store from './config'
import { ID, VERSION } from './constant'
import View from './view'
import './style.css'

class DynamicBlocker {
  private blockCount = 0
  private filteredClass = `${ID}-filtered`
  private configChanged = false
  private filterTimer: number | undefined
  private debounceTime = 600

  constructor(private store: Store, private view: View) {
    GM_registerMenuCommand('管理屏蔽规则', this.view.renderConfig)
    GM_registerMenuCommand('隐藏/显示统计信息', () => {
      this.store.toggleShowStat()
      this.view.renderStat()
    })
  }

  private filterDynamicByRules = (dynamicContent: string) => {
    return this.store.blockRules.some((rule) => {
      try {
        const regex = new RegExp(rule, 'i')
        return regex.test(dynamicContent)
      }
      catch {
        return false
      }
    })
  }

  filterDynamic = () => {
    clearTimeout(this.filterTimer)

    this.filterTimer = setTimeout(() => {
      // 参考自：https://greasyfork.org/zh-CN/scripts/478174/code
      const cards = Array.from(document.querySelectorAll<HTMLDivElement>('.bili-dyn-list__item'))
      cards.filter((card) => {
        if (card.classList.contains(this.filteredClass) && !this.configChanged) {
          return false
        }
        card.classList.add(this.filteredClass)

        if (this.filterDynamicByRules(card.textContent || '')) {
          return true
        }

        const contexts = Array.from(card.querySelectorAll<HTMLDivElement>('.bili-rich-text__content'))

        return contexts.some((c) => {
          const hasGoodsSpan = c.querySelector('span[data-type="goods"]')
          const hasLotterySpan = c.querySelector('span[data-type="lottery"]')
          const hasVoteSpan = c.querySelector('span[data-type="vote"]')
          return hasGoodsSpan || hasLotterySpan || hasVoteSpan
        })
      }).forEach((card) => {
        card.remove()
        this.blockCount++
        const content = card.textContent?.trim()?.replaceAll('\n', () => '')
        console.log(`已拦截 ${this.blockCount} 条动态：${content}`)
        this.view.updateStatInfo(`已拦截 ${this.blockCount} 条动态`)
      })

      this.configChanged = false
    }, this.debounceTime)
  }

  start() {
    const observer = new MutationObserver(this.filterDynamic)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
    this.store.addConfigChangeListener(() => {
      this.configChanged = true
      console.log('屏蔽规则更新，重新过滤动态')
      this.filterDynamic()
    })
  }
}

async function main() {
  console.log(`${import.meta.env.VITE_APP_ID}(v${VERSION})`)
  const store = new Store()
  const view = new View(store)
  new DynamicBlocker(store, view).start()
}

main().catch(e => console.error('存在未知异常：', e))
