import { useMemo, useState } from 'react'
import { View } from 'react-native'

import { EmptyState } from '@/components'
import { ScreenSkeleton } from '@/components/ui/skeleton'
import { TutorialGuideCard } from '@/features/tutorial'

import {
    getAvailableShopProducts,
    getPurchasableLootBoxCount,
    getShopCatalogSections,
    getTotalLootBoxCount,
} from '../constants/shop-products'
import { SHOP_TEXT, SHOP_UI, type ShopTab } from '../constants/shop-ui'
import type { UseShopReturn } from '../hooks/use-shop'
import { ShopBalanceCard } from './ShopBalanceCard'
import { ShopCategorySection } from './ShopCategorySection'
import { ShopHistoryList } from './ShopHistoryList'
import { ShopLivingMarketSection } from './ShopLivingMarketSection'
import { ShopSectionHeader } from './ShopSectionHeader'
import { ShopStudyPointsHub } from './ShopStudyPointsHub'
import { ShopTabSwitcher } from './ShopTabSwitcher'

type ShopScreenContentProps = {
  shop: UseShopReturn
}

export const ShopScreenContent = ({ shop }: ShopScreenContentProps) => {
  const [activeTab, setActiveTab] = useState<ShopTab>('coins')

  const {
    coins,
    studyPointsBalance,
    products,
    spProducts,
    dailyOfferCoins,
    dailyOfferSp,
    stock,
    lootBoxCounts,
    history,
    isLoading,
    canAfford,
    canAffordOffer,
    canAffordStock,
    handleSelectProduct,
    handleSelectDailyOffer,
    handleSelectStockItem,
    handleSelectSpProduct,
    handleUpgradeLootBox,
    isPurchasing,
  } = shop

  const catalogSections = useMemo(() => getShopCatalogSections(products), [products])

  const availableCount = useMemo(() => getAvailableShopProducts().length, [])
  const purchasableLootBoxes = getPurchasableLootBoxCount()
  const totalLootBoxes = getTotalLootBoxCount()

  const hasOffersContent = useMemo(() => {
    const hasOffers = dailyOfferCoins != null || dailyOfferSp != null
    const hasStock =
      stock.daily.coins.length > 0 ||
      stock.daily.studyPoints.length > 0 ||
      stock.weekly.coins.length > 0 ||
      stock.weekly.studyPoints.length > 0

    return hasOffers || hasStock
  }, [dailyOfferCoins, dailyOfferSp, stock])

  if (isLoading) {
    return <ScreenSkeleton variant="shop" className="gap-6 pb-8" />
  }

  return (
    <View className="gap-5 pb-8">
      <ShopBalanceCard
        coins={coins}
        studyPoints={studyPointsBalance}
        productCount={availableCount}
        purchasableLootBoxes={purchasableLootBoxes}
        totalLootBoxes={totalLootBoxes}
      />

      <ShopTabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      <TutorialGuideCard />

      {activeTab === 'coins' ? (
        <View className="gap-4">
          <ShopSectionHeader
            kicker={SHOP_UI.coins.kicker}
            kickerClassName={SHOP_TEXT.kickerGold}
            title={SHOP_UI.coins.title}
            subtitle={SHOP_UI.coins.subtitle}
          />

          {catalogSections.map((section) => (
            <ShopCategorySection
              key={section.category}
              section={section}
              canAfford={canAfford}
              onPurchase={handleSelectProduct}
            />
          ))}
        </View>
      ) : null}

      {activeTab === 'offers' ? (
        hasOffersContent ? (
          <ShopLivingMarketSection
            dailyOfferCoins={dailyOfferCoins}
            dailyOfferSp={dailyOfferSp}
            stock={stock}
            canAffordOffer={canAffordOffer}
            canAffordStock={canAffordStock}
            isPurchasing={isPurchasing}
            onPurchaseOffer={handleSelectDailyOffer}
            onPurchaseStock={handleSelectStockItem}
          />
        ) : (
          <EmptyState
            icon="pricetag-outline"
            title={SHOP_UI.offers.emptyTitle}
            description={SHOP_UI.offers.emptyDescription}
          />
        )
      ) : null}

      {activeTab === 'sp' ? (
        <ShopStudyPointsHub
          balance={studyPointsBalance}
          products={spProducts}
          lootBoxCounts={lootBoxCounts}
          isPurchasing={isPurchasing}
          onPurchase={handleSelectSpProduct}
          onUpgrade={handleUpgradeLootBox}
        />
      ) : null}

      {history.length > 0 ? <ShopHistoryList history={history} /> : null}
    </View>
  )
}
